"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  driverProgressStatuses,
  offerStatuses,
  type DriverProgressStatus,
  type OfferStatus,
} from "@/lib/constants";
import { parseCentralDispatchLoad } from "@/lib/central-dispatch-parser";
import {
  InputError,
  booleanFromCheckbox,
  optionalNumber,
  optionalString,
  parsePreferredRoutes,
  requiredDate,
  requiredNumber,
  requiredString,
  requiredUuid,
} from "@/lib/form-utils";
import { getRankedDriverMatches } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, safeReturnTo, withMessage } from "@/lib/utils";
import type { Database, Json } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];
type LoadRow = Database["public"]["Tables"]["loads"]["Row"];

// Shape returned by every Phase 1 RPC: { ok: boolean, reason?: string, ... }
type RpcResult = { ok?: boolean; reason?: string } & Record<string, unknown>;

const RPC_REASON_MESSAGES: Record<string, string> = {
  load_not_found: "Load not found.",
  load_unavailable: "This load is no longer available.",
  load_completed: "Completed loads cannot be unassigned.",
  pending_offer_exists: "A pending offer already exists for this driver.",
  already_accepted: "Another driver already accepted this load.",
  offer_not_found: "Offer not found.",
  offer_not_pending: "This offer is no longer pending.",
  wrong_status: "This load is not in an assignable state.",
};

function reasonMessage(reason: string | undefined, fallback: string): string {
  if (!reason) return fallback;
  return RPC_REASON_MESSAGES[reason] ?? fallback;
}

// 23505 is Postgres unique-violation. The partial unique indexes on offers
// (offers_one_pending_per_driver_load_idx and offers_one_accepted_per_load_idx)
// fire here when a race squeezes through the RPC's logical guards.
function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: unknown }).code;
  return code === "23505";
}

function redirectTo(path: string, type: "error" | "success", message: string): never {
  redirect(withMessage(path, type, message));
}

function getReturnPath(formData: FormData, fallback: string) {
  // A1: hidden form fields are user-controlled. Restrict to internal paths only.
  return safeReturnTo(optionalString(formData, "return_to"), fallback);
}

function asOfferStatus(value: string | null): OfferStatus | null {
  return offerStatuses.find((status) => status === value) ?? null;
}

function asDriverProgressStatus(value: string | null): DriverProgressStatus | null {
  return driverProgressStatuses.find((status) => status === value) ?? null;
}

function buildOfferMessage(load: LoadRow, price: number) {
  return [
    `Carga: ${load.pickup_city}, ${load.pickup_state} -> ${load.delivery_city}, ${load.delivery_state}`,
    `Pago: ${formatCurrency(price)}`,
    `Vehiculo: ${load.vehicle_type}`,
    `Fecha de recogida: ${load.pickup_date}`,
  ].join(" | ");
}

function nowIso() {
  return new Date().toISOString();
}

function revalidateDispatch(loadId?: string | null) {
  revalidatePath("/");
  revalidatePath("/dispatcher");
  revalidatePath("/drivers");
  revalidatePath("/driver");
  revalidatePath("/driver-panel");

  if (loadId) {
    revalidatePath(`/loads/${loadId}`);
  }
}

async function getLoadAndDriver(loadId: string, driverId: string) {
  const supabase = await createClient();

  const [loadResult, driverResult] = await Promise.all([
    supabase.from("loads").select("*").eq("id", loadId).single(),
    supabase.from("drivers").select("*").eq("id", driverId).single(),
  ]);

  if (loadResult.error || !loadResult.data) {
    throw new InputError("Load not found.");
  }

  if (driverResult.error || !driverResult.data) {
    throw new InputError("Driver not found.");
  }

  return {
    supabase,
    load: loadResult.data,
    driver: driverResult.data,
  };
}

// Pre-flight UX check (driver availability + trailer fit). Not a transactional
// invariant — the RPC is the source of truth for atomic checks.
function validateAssignableDriver(load: LoadRow, driver: DriverRow) {
  if (!driver.is_available) {
    throw new InputError("Driver is not currently available.");
  }

  const matches = getRankedDriverMatches(load, [driver]);
  if (matches.length === 0) {
    throw new InputError("Driver trailer or lane does not match this load.");
  }
}

function normalizeDriverLocation(value: string) {
  const match = value.match(/^(.+?),\s*([A-Za-z]{2})$/);

  if (!match) {
    throw new InputError("Enter location like Newark, NJ.");
  }

  const city = match[1].trim();
  const state = match[2].toUpperCase();

  if (!city) {
    throw new InputError("City is required.");
  }

  return `${city}, ${state}`;
}

export async function createLoadAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");

  try {
    const supabase = await createClient();

    const payload = {
      pickup_city: requiredString(formData, "pickup_city", "Pickup city"),
      pickup_state: requiredString(formData, "pickup_state", "Pickup state").toUpperCase(),
      delivery_city: requiredString(formData, "delivery_city", "Delivery city"),
      delivery_state: requiredString(formData, "delivery_state", "Delivery state").toUpperCase(),
      vehicle_type: requiredString(formData, "vehicle_type", "Vehicle type"),
      price: requiredNumber(formData, "price", "Price"),
      distance_miles: optionalNumber(formData, "distance_miles"),
      pickup_date: requiredDate(formData, "pickup_date", "Pickup date"),
      notes: optionalString(formData, "notes"),
      status: "NEW" as const,
    };

    const { error } = await supabase.from("loads").insert(payload);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[createLoadAction] failed", error);
    redirectTo(returnTo, "error", "Unable to create load.");
  }

  revalidateDispatch();
  redirectTo(returnTo, "success", "Load created.");
}

export async function createLoadFromCentralDispatchAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");

  try {
    const pastedText = requiredString(formData, "central_dispatch_text", "Central Dispatch load text");
    const parsedLoad = parseCentralDispatchLoad(pastedText);
    const supabase = await createClient();

    if (parsedLoad.externalLoadId) {
      // Use the new (external_source, external_id) slot now that it exists.
      // The legacy notes-based dedupe is kept as a fallback for rows created
      // before this migration.
      const existingLoadResult = await supabase
        .from("loads")
        .select("id")
        .eq("external_source", "central_dispatch")
        .eq("external_id", parsedLoad.externalLoadId)
        .limit(1)
        .maybeSingle();

      if (existingLoadResult.error) {
        throw new Error(existingLoadResult.error.message);
      }

      if (existingLoadResult.data) {
        throw new InputError(`Central Dispatch load ${parsedLoad.externalLoadId} is already on the board.`);
      }
    }

    const { error } = await supabase.from("loads").insert({
      pickup_city: parsedLoad.pickup_city,
      pickup_state: parsedLoad.pickup_state,
      delivery_city: parsedLoad.delivery_city,
      delivery_state: parsedLoad.delivery_state,
      vehicle_type: parsedLoad.vehicle_type,
      price: parsedLoad.price,
      distance_miles: parsedLoad.distance_miles,
      pickup_date: parsedLoad.pickup_date,
      notes: parsedLoad.notes,
      status: "NEW",
      external_source: "central_dispatch",
      external_id: parsedLoad.externalLoadId,
      external_synced_at: nowIso(),
    });

    if (error) {
      if (isUniqueViolation(error)) {
        throw new InputError("That Central Dispatch load is already on the board.");
      }
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[createLoadFromCentralDispatchAction] failed", error);
    redirectTo(returnTo, "error", "Unable to create load from pasted text.");
  }

  revalidateDispatch();
  redirectTo(returnTo, "success", "Central Dispatch load added.");
}

export async function updateLoadAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");
  let loadId: string | null = null;

  try {
    loadId = requiredUuid(formData, "id", "Load");
    const supabase = await createClient();

    // B2: status is no longer dispatcher-editable through this form. Use
    // unassignLoadAction or the offer/progress RPCs to change status.
    // We also lock route/price edits on non-NEW loads so existing offers
    // and accepted prices stay consistent (Phase 2 item A3 — landed early
    // because skipping it leaves a workflow trap).
    const currentLoadResult = await supabase
      .from("loads")
      .select("status")
      .eq("id", loadId)
      .single();

    if (currentLoadResult.error || !currentLoadResult.data) {
      throw new InputError("Load not found.");
    }

    const currentStatus = currentLoadResult.data.status;

    let payload: Database["public"]["Tables"]["loads"]["Update"];

    if (currentStatus === "NEW") {
      payload = {
        pickup_city: requiredString(formData, "pickup_city", "Pickup city"),
        pickup_state: requiredString(formData, "pickup_state", "Pickup state").toUpperCase(),
        delivery_city: requiredString(formData, "delivery_city", "Delivery city"),
        delivery_state: requiredString(formData, "delivery_state", "Delivery state").toUpperCase(),
        vehicle_type: requiredString(formData, "vehicle_type", "Vehicle type"),
        price: requiredNumber(formData, "price", "Price"),
        distance_miles: optionalNumber(formData, "distance_miles"),
        pickup_date: requiredDate(formData, "pickup_date", "Pickup date"),
        notes: optionalString(formData, "notes"),
      };
    } else {
      // Notes-only edit on OFFERED / ASSIGNED / COMPLETED loads.
      payload = {
        notes: optionalString(formData, "notes"),
      };
    }

    const { error } = await supabase.from("loads").update(payload).eq("id", loadId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[updateLoadAction] failed", error);
    redirectTo(returnTo, "error", "Unable to update load.");
  }

  revalidateDispatch(loadId);
  redirectTo(returnTo, "success", "Load updated.");
}

export async function deleteLoadAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");
  let loadId: string | null = null;

  try {
    loadId = requiredUuid(formData, "id", "Load");
    const supabase = await createClient();

    // B3: refuse hard-delete on anything other than a never-touched NEW load.
    // Anything with offers, an assignment, or a completed status must go
    // through unassign / archive (archive lands in Phase 2).
    const loadResult = await supabase
      .from("loads")
      .select("status")
      .eq("id", loadId)
      .single();

    if (loadResult.error || !loadResult.data) {
      throw new InputError("Load not found.");
    }

    if (loadResult.data.status !== "NEW") {
      throw new InputError("Only NEW loads can be deleted. Unassign first.");
    }

    const offerCheck = await supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("load_id", loadId);

    if (offerCheck.error) {
      throw new Error(offerCheck.error.message);
    }

    if ((offerCheck.count ?? 0) > 0) {
      throw new InputError("This load has offer history. Unassign or archive instead.");
    }

    const { error } = await supabase.from("loads").delete().eq("id", loadId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[deleteLoadAction] failed", error);
    redirectTo(returnTo, "error", "Unable to delete load.");
  }

  revalidateDispatch(loadId);
  redirectTo(returnTo, "success", "Load deleted.");
}

export async function createDriverAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/drivers");

  try {
    const supabase = await createClient();
    const preferredRouteText = optionalString(formData, "preferred_routes");
    const preferredRoutes = parsePreferredRoutes(preferredRouteText);

    const payload: Database["public"]["Tables"]["drivers"]["Insert"] = {
      name: requiredString(formData, "name", "Driver name"),
      phone: requiredString(formData, "phone", "Phone"),
      current_location: requiredString(formData, "current_location", "Current location"),
      preferred_routes: preferredRoutes as Json,
      trailer_type: requiredString(formData, "trailer_type", "Trailer type"),
      is_available: booleanFromCheckbox(formData, "is_available"),
    };

    const { error } = await supabase.from("drivers").insert(payload);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[createDriverAction] failed", error);
    redirectTo(returnTo, "error", "Unable to create driver.");
  }

  revalidateDispatch();
  redirectTo(returnTo, "success", "Driver created.");
}

export async function updateDriverAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/drivers");
  let driverId: string | null = null;

  try {
    driverId = requiredUuid(formData, "id", "Driver");
    const supabase = await createClient();
    const preferredRoutes = parsePreferredRoutes(optionalString(formData, "preferred_routes"));

    const payload: Database["public"]["Tables"]["drivers"]["Update"] = {
      name: requiredString(formData, "name", "Driver name"),
      phone: requiredString(formData, "phone", "Phone"),
      current_location: requiredString(formData, "current_location", "Current location"),
      preferred_routes: preferredRoutes as Json,
      trailer_type: requiredString(formData, "trailer_type", "Trailer type"),
      is_available: booleanFromCheckbox(formData, "is_available"),
    };

    const { error } = await supabase.from("drivers").update(payload).eq("id", driverId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[updateDriverAction] failed", error);
    redirectTo(returnTo, "error", "Unable to update driver.");
  }

  revalidateDispatch();
  redirectTo(returnTo, "success", "Driver updated.");
}

export async function deleteDriverAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/drivers");
  let driverId: string | null = null;

  try {
    driverId = requiredUuid(formData, "id", "Driver");
    const supabase = await createClient();
    const assignedLoadsResult = await supabase
      .from("loads")
      .select("id", { count: "exact", head: true })
      .eq("driver_id", driverId)
      .eq("status", "ASSIGNED");

    if (assignedLoadsResult.error) {
      throw new Error(assignedLoadsResult.error.message);
    }

    if ((assignedLoadsResult.count ?? 0) > 0) {
      throw new InputError("Unassign active loads before deleting this driver.");
    }

    const { error } = await supabase.from("drivers").delete().eq("id", driverId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[deleteDriverAction] failed", error);
    redirectTo(returnTo, "error", "Unable to delete driver.");
  }

  revalidateDispatch();
  redirectTo(returnTo, "success", "Driver deleted.");
}

export async function updateDriverLocationAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/driver");
  let driverId: string | null = null;

  try {
    driverId = requiredUuid(formData, "driver_id", "Driver");
    const currentLocation = normalizeDriverLocation(requiredString(formData, "current_location", "Current location"));
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("drivers")
      .update({ current_location: currentLocation })
      .eq("id", driverId)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    // A5: filtered updates that match zero rows succeed silently. Verify.
    if (!data || data.length === 0) {
      throw new InputError("Driver not found.");
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[updateDriverLocationAction] failed", error);
    redirectTo(returnTo, "error", "Unable to update driver location.");
  }

  revalidateDispatch();
  redirectTo(returnTo, "success", "Driver location updated.");
}

// B5: sendOfferAction is now a single RPC call. The pre-flight checks below
// are dispatcher UX (friendly messages); the transaction is in send_offer().
export async function sendOfferAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");
  let loadId: string | null = null;

  try {
    loadId = requiredUuid(formData, "load_id", "Load");
    const driverId = requiredUuid(formData, "driver_id", "Driver");
    const { supabase, load, driver } = await getLoadAndDriver(loadId, driverId);

    validateAssignableDriver(load, driver);

    const offeredPrice =
      optionalNumber(formData, "price") ?? optionalNumber(formData, "offered_price") ?? load.price;
    const messageBody = buildOfferMessage(load, offeredPrice);

    const { data, error } = await supabase.rpc("send_offer", {
      p_load_id: loadId,
      p_driver_id: driverId,
      p_offered_price: offeredPrice,
      p_message_body: messageBody,
    });

    if (error) {
      if (isUniqueViolation(error)) {
        throw new InputError("Another dispatcher just changed this load.");
      }
      throw new Error(error.message);
    }

    const result = data as RpcResult | null;
    if (!result?.ok) {
      throw new InputError(reasonMessage(result?.reason, "Unable to send offer."));
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[sendOfferAction] failed", error);
    redirectTo(returnTo, "error", "Unable to send offer.");
  }

  revalidateDispatch(loadId);
  redirectTo(returnTo, "success", "Offer queued in mock SMS outbox.");
}

// H1: assignLoadAction routes through accept_offer (when a pending offer
// exists for this driver) or assign_load (no pending offer). Both atomic.
export async function assignLoadAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");
  let loadId: string | null = null;

  try {
    loadId = requiredUuid(formData, "load_id", "Load");
    const driverId = requiredUuid(formData, "driver_id", "Driver");
    const agreedPrice = optionalNumber(formData, "price") ?? optionalNumber(formData, "agreed_price");
    const { supabase, load, driver } = await getLoadAndDriver(loadId, driverId);

    validateAssignableDriver(load, driver);

    const pendingOfferResult = await supabase
      .from("offers")
      .select("id")
      .eq("load_id", loadId)
      .eq("driver_id", driverId)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingOfferResult.error) {
      throw new Error(pendingOfferResult.error.message);
    }

    if (pendingOfferResult.data?.id) {
      const { data, error } = await supabase.rpc("accept_offer", {
        p_offer_id: pendingOfferResult.data.id,
        p_agreed_price: agreedPrice ?? load.price,
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as RpcResult | null;
      if (!result?.ok) {
        throw new InputError(reasonMessage(result?.reason, "Unable to assign load."));
      }
    } else {
      const agreedValue = agreedPrice ?? load.price;
      const { data, error } = await supabase.rpc("assign_load", {
        p_load_id: loadId,
        p_driver_id: driverId,
        p_agreed_price: agreedValue,
        p_message_body: buildOfferMessage(load, agreedValue),
      });

      if (error) {
        if (isUniqueViolation(error)) {
          throw new InputError("Another dispatcher just changed this load.");
        }
        throw new Error(error.message);
      }

      const result = data as RpcResult | null;
      if (!result?.ok) {
        throw new InputError(reasonMessage(result?.reason, "Unable to assign load."));
      }
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[assignLoadAction] failed", error);
    redirectTo(returnTo, "error", "Unable to assign load.");
  }

  revalidateDispatch(loadId);
  redirectTo(returnTo, "success", "Load assigned.");
}

// B2: explicit unassign action (replaces the dropdown-driven status edit).
export async function unassignLoadAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");
  let loadId: string | null = null;

  try {
    loadId = requiredUuid(formData, "load_id", "Load");
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("unassign_load", {
      p_load_id: loadId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = data as RpcResult | null;
    if (!result?.ok) {
      throw new InputError(reasonMessage(result?.reason, "Unable to unassign load."));
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[unassignLoadAction] failed", error);
    redirectTo(returnTo, "error", "Unable to unassign load.");
  }

  revalidateDispatch(loadId);
  redirectTo(returnTo, "success", "Load unassigned.");
}

// H2 + B6: refuse to act on non-pending offers. Acceptance routes through
// accept_offer (which now also enforces this guard server-side).
export async function updateOfferStatusAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/");
  let loadIdForRevalidate: string | null = null;

  try {
    const offerId = requiredUuid(formData, "offer_id", "Offer");
    const decision = asOfferStatus(requiredString(formData, "decision", "Decision"));

    if (!decision || decision === "pending") {
      throw new InputError("Offer decision is invalid.");
    }

    const supabase = await createClient();
    const offerLookup = await supabase.from("offers").select("*").eq("id", offerId).single();

    if (offerLookup.error || !offerLookup.data) {
      throw new InputError("Offer not found.");
    }

    loadIdForRevalidate = offerLookup.data.load_id;

    if (offerLookup.data.status !== "pending") {
      throw new InputError("This offer is no longer pending.");
    }

    if (decision === "accepted") {
      const { data, error } = await supabase.rpc("accept_offer", {
        p_offer_id: offerId,
        p_agreed_price: optionalNumber(formData, "agreed_price") ?? offerLookup.data.offered_price,
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as RpcResult | null;
      if (!result?.ok) {
        throw new InputError(
          reasonMessage(result?.reason, "This load was already taken before the offer was accepted."),
        );
      }
    } else {
      // Reject: filtered update guarded by status='pending' so two
      // concurrent rejects don't both report success.
      const { data, error } = await supabase
        .from("offers")
        .update({
          status: "rejected",
          responded_at: nowIso(),
        })
        .eq("id", offerId)
        .eq("status", "pending")
        .select("id");

      if (error) {
        throw new Error(error.message);
      }

      // A5: zero-row guard.
      if (!data || data.length === 0) {
        throw new InputError("This offer is no longer pending.");
      }

      const [pendingResult, acceptedResult] = await Promise.all([
        supabase
          .from("offers")
          .select("id", { count: "exact", head: true })
          .eq("load_id", offerLookup.data.load_id)
          .eq("status", "pending"),
        supabase
          .from("offers")
          .select("id", { count: "exact", head: true })
          .eq("load_id", offerLookup.data.load_id)
          .eq("status", "accepted"),
      ]);

      if (pendingResult.error || acceptedResult.error) {
        throw new Error(
          pendingResult.error?.message ?? acceptedResult.error?.message ?? "Offer state check failed.",
        );
      }

      // If no offers remain in flight and the load isn't assigned, walk
      // it back to NEW so the board doesn't show a phantom OFFERED state.
      if ((pendingResult.count ?? 0) === 0 && (acceptedResult.count ?? 0) === 0) {
        const { error: loadError } = await supabase
          .from("loads")
          .update({ status: "NEW" })
          .eq("id", offerLookup.data.load_id)
          .is("driver_id", null);

        if (loadError) {
          throw new Error(loadError.message);
        }
      }
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[updateOfferStatusAction] failed", error);
    redirectTo(returnTo, "error", "Unable to update offer.");
  }

  revalidateDispatch(loadIdForRevalidate);
  redirectTo(returnTo, "success", "Offer updated.");
}

// Phase 2.2: pickup/delivery photo upload.
//
// File goes to storage at {load_id}/{stage}/{uuid}.{ext}. Metadata row in
// public.load_photos. We do not pre-check the load status — a driver might
// upload pickup photos before flipping to picked_up, and that's fine.
export async function uploadLoadPhotoAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/driver");

  try {
    const loadId = requiredUuid(formData, "load_id", "Load");
    const driverId = requiredUuid(formData, "driver_id", "Driver");
    const stageRaw = requiredString(formData, "stage", "Stage");

    if (stageRaw !== "pickup" && stageRaw !== "delivery") {
      throw new InputError("Stage must be 'pickup' or 'delivery'.");
    }
    const stage: "pickup" | "delivery" = stageRaw;

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      throw new InputError("Please choose a photo to upload.");
    }

    // Hard cap matches the storage bucket setting; bucket will also reject.
    if (fileEntry.size > 10 * 1024 * 1024) {
      throw new InputError("Photo is too large (max 10 MB).");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new InputError("You must be signed in to upload photos.");
    }

    // Derive extension from the original filename. Default to jpg if absent
    // or unrecognized — the storage policy enforces MIME type at write.
    const originalName = fileEntry.name ?? "";
    const dotIdx = originalName.lastIndexOf(".");
    const extension = dotIdx > 0 ? originalName.slice(dotIdx + 1).toLowerCase() : "jpg";
    const safeExt = ["jpg", "jpeg", "png", "heic", "webp"].includes(extension) ? extension : "jpg";

    const storagePath = `${loadId}/${stage}/${crypto.randomUUID()}.${safeExt}`;
    const arrayBuffer = await fileEntry.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("load-photos")
      .upload(storagePath, arrayBuffer, {
        contentType: fileEntry.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { error: insertError } = await supabase.from("load_photos").insert({
      load_id: loadId,
      driver_id: driverId,
      stage,
      storage_path: storagePath,
      created_by: user.id,
    });

    if (insertError) {
      // Try to clean up the orphan storage object so the bucket doesn't
      // accumulate untracked files. Best-effort; ignore errors here.
      await supabase.storage.from("load-photos").remove([storagePath]).catch(() => {});
      throw new Error(insertError.message);
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[uploadLoadPhotoAction] failed", error);
    redirectTo(returnTo, "error", "Unable to upload photo.");
  }

  revalidateDispatch(requiredUuid(formData, "load_id", "Load"));
  redirectTo(returnTo, "success", "Photo uploaded.");
}

// B4: route driver progress through the gated RPC. No COMPLETED -> ASSIGNED
// regression, no progress on un-assigned loads.
export async function updateDriverLoadStatusAction(formData: FormData) {
  const returnTo = getReturnPath(formData, "/driver");
  let loadId: string | null = null;

  try {
    loadId = requiredUuid(formData, "load_id", "Load");
    const driverStatus = asDriverProgressStatus(requiredString(formData, "driver_status", "Driver status"));

    if (!driverStatus) {
      throw new InputError("Driver status is invalid.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("set_driver_progress", {
      p_load_id: loadId,
      p_driver_status: driverStatus,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = data as RpcResult | null;
    if (!result?.ok) {
      throw new InputError(reasonMessage(result?.reason, "Unable to update driver progress."));
    }
  } catch (error) {
    if (error instanceof InputError) {
      redirectTo(returnTo, "error", error.message);
    }

    console.error("[updateDriverLoadStatusAction] failed", error);
    redirectTo(returnTo, "error", "Unable to update driver progress.");
  }

  revalidateDispatch(loadId);
  redirectTo(returnTo, "success", "Driver progress updated.");
}
