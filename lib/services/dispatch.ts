import {
  assignLoadOpportunityToDriver,
  assignLoadToDriver,
  createActivityEvent,
  createDriver,
  createLoad,
  createLoadOpportunity,
  createLoadOpportunityVehicle,
  createLoadVehicle,
  createProblemFlag,
  deleteLoadOpportunityVehicle,
  deleteLoadVehicle,
  getDriverBySourceLeadId,
  getDriverById,
  getLeadById,
  getLoadById,
  getLoadOpportunityById,
  listLoadOpportunityVehiclesByOpportunityId,
  resolveProblemFlag,
  updateDriverMovement,
  updateDriverNotes,
  updateDriverProfile,
  updateDriverStatus,
  updateLeadActivity,
  updateLoadNotes,
  updateLoadOperationalDetails,
  updateLoadOpportunityNotes,
  updateLoadOpportunityOperationalDetails,
  updateLoadOpportunityStatus,
  updateLoadOpportunityVehicle,
  updateLoadStatus,
  updateLoadVehicle,
} from "@/lib/db";
import {
  canOverrideStatusTransitions,
  getDashboardSession,
  getKnownDispatcherEmails,
} from "@/lib/auth";
import type {
  ActivityActionType,
  ActivityEntityType,
  ActivityEventCreateInput,
  DispatchLoadStatus,
  DriverCreateInput,
  DriverStatus,
  Load,
  LoadCreateInput,
  LoadOpportunity,
  LoadOpportunityCreateInput,
  LoadOpportunityOperationalUpdateInput,
  LoadOpportunityStatus,
  LoadOpportunityVehicle,
  LoadOpportunityVehicleCreateInput,
  LoadOpportunityVehicleUpdateInput,
  LoadOperationalUpdateInput,
  LoadVehicleCreateInput,
  LoadVehicleOperabilityStatus,
  LoadVehicleUpdateInput,
  UserRole,
} from "@/lib/types";
import {
  dispatchLoadStatuses,
  driverStatuses,
  loadOpportunityStatuses,
  loadVehicleOperabilityStatuses,
  problemFlagTypes,
  problemPriorityLevels,
} from "@/lib/types";
import {
  normalizeEmail,
  normalizeOptionalText,
  normalizePhone,
  normalizeText,
} from "@/lib/utils";
import { z } from "zod";

const loadStatusTransitions: Record<
  DispatchLoadStatus,
  readonly DispatchLoadStatus[]
> = {
  posted: ["negotiating", "booked", "problem_hold", "closed"],
  negotiating: ["booked", "problem_hold", "closed"],
  booked: ["assigned", "problem_hold", "closed"],
  assigned: ["pickup_scheduled", "problem_hold", "closed"],
  pickup_scheduled: ["picked_up", "problem_hold", "closed"],
  picked_up: ["in_transit", "problem_hold", "closed"],
  in_transit: ["delivered", "problem_hold"],
  delivered: ["closed", "problem_hold"],
  closed: [],
  problem_hold: [
    "posted",
    "negotiating",
    "booked",
    "assigned",
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "delivered",
    "closed",
  ],
};

const opportunityStatusTransitions: Record<
  LoadOpportunityStatus,
  readonly LoadOpportunityStatus[]
> = {
  new: ["needs_review", "needs_quote", "on_hold", "closed_lost"],
  needs_review: [
    "needs_quote",
    "awaiting_customer",
    "ready_to_post",
    "on_hold",
    "closed_lost",
  ],
  needs_quote: ["awaiting_customer", "ready_to_post", "on_hold", "closed_lost"],
  awaiting_customer: [
    "ready_to_post",
    "closed_won",
    "closed_lost",
    "on_hold",
  ],
  ready_to_post: ["closed_won", "closed_lost", "on_hold"],
  closed_won: [],
  closed_lost: [],
  on_hold: [
    "new",
    "needs_review",
    "needs_quote",
    "awaiting_customer",
    "ready_to_post",
    "closed_won",
    "closed_lost",
  ],
};

const driverCreateSchema = z.object({
  sourceLeadId: z.string().uuid().nullable(),
  assignedDispatcherEmail: z.string().email().nullable(),
  company: z.string().min(1).max(120),
  driverName: z.string().min(1).max(120),
  phone: z.string().min(1).refine((value) => value.replace(/\D/g, "").length >= 7),
  truckType: z.string().min(1).max(120),
  truckUnitNumber: z.string().max(60).nullable(),
  truckVin: z.string().length(17).nullable(),
  trailerUnitNumber: z.string().max(60).nullable(),
  trailerVin: z.string().length(17).nullable(),
  preferredLanes: z.string().max(240).nullable(),
  homeBase: z.string().min(1).max(120),
  currentLocation: z.string().max(160).nullable(),
  availableFrom: z.string().nullable(),
  capacity: z.number().int().positive().nullable(),
  status: z.enum(driverStatuses),
  notes: z.string().max(2000).nullable(),
});

const leadToDriverConversionSchema = z.object({
  leadId: z.string().uuid(),
  company: z.string().min(1).max(120),
  homeBase: z.string().min(1).max(120),
  assignedDispatcherEmail: z.string().email().nullable(),
});

const loadCreateSchema = z.object({
  driverId: z.string().uuid().nullable(),
  sourceLeadId: z.string().uuid().nullable(),
  sourceOpportunityId: z.string().uuid().nullable(),
  company: z.string().min(1).max(160),
  origin: z.string().min(1).max(160),
  destination: z.string().min(1).max(160),
  pickupCity: z.string().max(80).nullable(),
  pickupState: z.string().max(32).nullable(),
  pickupZip: z.string().max(20).nullable(),
  deliveryCity: z.string().max(80).nullable(),
  deliveryState: z.string().max(32).nullable(),
  deliveryZip: z.string().max(20).nullable(),
  trailerType: z.string().max(80).nullable(),
  customerName: z.string().max(120).nullable(),
  customerPhone: z.string().max(40).nullable(),
  customerEmail: z.string().email().nullable(),
  pickupDate: z.string().nullable(),
  deliveryDate: z.string().nullable(),
  broker: z.string().max(160),
  customerPrice: z.number().nonnegative().nullable(),
  carrierPay: z.number().nonnegative().nullable(),
  depositCollected: z.boolean(),
  codAmount: z.number().nonnegative().nullable(),
  referenceNumber: z.string().max(120),
  contactName: z.string().min(1).max(120),
  contactPhone: z.string().min(1).max(40),
  pickupContactName: z.string().max(120).nullable(),
  pickupContactPhone: z.string().max(40).nullable(),
  deliveryContactName: z.string().max(120).nullable(),
  deliveryContactPhone: z.string().max(40).nullable(),
  carrierCompany: z.string().max(160).nullable(),
  carrierMcNumber: z.string().max(80).nullable(),
  carrierDispatcherName: z.string().max(120).nullable(),
  carrierDispatcherPhone: z.string().max(40).nullable(),
  carrierDriverName: z.string().max(120).nullable(),
  carrierDriverPhone: z.string().max(40).nullable(),
  truckTrailerType: z.string().max(120).nullable(),
  rate: z.number().nonnegative(),
  status: z.enum(dispatchLoadStatuses),
  notes: z.string().max(2000).nullable(),
});

const loadOperationalUpdateSchema = z.object({
  loadId: z.string().uuid(),
  pickupCity: z.string().max(80).nullable(),
  pickupState: z.string().max(32).nullable(),
  pickupZip: z.string().max(20).nullable(),
  deliveryCity: z.string().max(80).nullable(),
  deliveryState: z.string().max(32).nullable(),
  deliveryZip: z.string().max(20).nullable(),
  trailerType: z.string().max(80).nullable(),
  customerName: z.string().max(120).nullable(),
  customerPhone: z.string().max(40).nullable(),
  customerEmail: z.string().email().nullable(),
  pickupDate: z.string().nullable(),
  deliveryDate: z.string().nullable(),
  customerPrice: z.number().nonnegative().nullable(),
  carrierPay: z.number().nonnegative().nullable(),
  depositCollected: z.boolean(),
  codAmount: z.number().nonnegative().nullable(),
  referenceNumber: z.string().max(120),
  contactName: z.string().min(1).max(120),
  contactPhone: z.string().min(1).max(40),
  pickupContactName: z.string().max(120).nullable(),
  pickupContactPhone: z.string().max(40).nullable(),
  deliveryContactName: z.string().max(120).nullable(),
  deliveryContactPhone: z.string().max(40).nullable(),
  carrierCompany: z.string().max(160).nullable(),
  carrierMcNumber: z.string().max(80).nullable(),
  carrierDispatcherName: z.string().max(120).nullable(),
  carrierDispatcherPhone: z.string().max(40).nullable(),
  carrierDriverName: z.string().max(120).nullable(),
  carrierDriverPhone: z.string().max(40).nullable(),
  truckTrailerType: z.string().max(120).nullable(),
});

const loadStatusUpdateSchema = z.object({
  loadId: z.string().uuid(),
  status: z.enum(dispatchLoadStatuses),
});

const loadNotesUpdateSchema = z.object({
  loadId: z.string().uuid(),
  notes: z.string().max(2000).nullable(),
});

const loadAssignmentSchema = z.object({
  loadId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
});

const driverMovementUpdateSchema = z.object({
  driverId: z.string().uuid(),
  assignedDispatcherEmail: z.string().email().nullable(),
  truckUnitNumber: z.string().max(60).nullable(),
  truckVin: z.string().length(17).nullable(),
  trailerUnitNumber: z.string().max(60).nullable(),
  trailerVin: z.string().length(17).nullable(),
  currentLocation: z.string().max(160).nullable(),
  availableFrom: z.string().nullable(),
  capacity: z.number().int().positive().nullable(),
});

const loadOpportunityCreateSchema = z.object({
  source: z.string().min(1).max(120),
  sourceUrl: z.string().max(1000).nullable(),
  sourceReference: z.string().min(1).max(120),
  company: z.string().max(160).nullable(),
  origin: z.string().min(1).max(160),
  destination: z.string().min(1).max(160),
  pickupCity: z.string().max(80).nullable(),
  pickupState: z.string().max(32).nullable(),
  pickupZip: z.string().max(20).nullable(),
  deliveryCity: z.string().max(80).nullable(),
  deliveryState: z.string().max(32).nullable(),
  deliveryZip: z.string().max(20).nullable(),
  trailerType: z.string().max(80).nullable(),
  customerName: z.string().max(120).nullable(),
  customerPhone: z.string().max(40).nullable(),
  customerEmail: z.string().email().nullable(),
  firstAvailableDate: z.string().nullable(),
  pickupWindow: z.string().nullable(),
  deliveryWindow: z.string().nullable(),
  vehiclesCount: z.number().int().positive(),
  customerPrice: z.number().nonnegative().nullable(),
  carrierPay: z.number().nonnegative().nullable(),
  rate: z.number().nonnegative().nullable(),
  contactName: z.string().min(1).max(120),
  contactPhone: z.string().min(1).max(40),
  status: z.enum(loadOpportunityStatuses),
  assignedDriverId: z.string().uuid().nullable(),
  notes: z.string().max(2000).nullable(),
});

const opportunityVehicleDraftSchema = z.object({
  year: z.number().int().min(1900).max(2100).nullable(),
  make: z.string().min(1).max(120),
  model: z.string().min(1).max(120),
  vin: z.string().length(17).nullable(),
  lotNumber: z.string().max(120).nullable(),
  operability: z.enum(loadVehicleOperabilityStatuses),
});

const loadOpportunityOperationalUpdateSchema = z.object({
  opportunityId: z.string().uuid(),
  sourceReference: z.string().min(1).max(120),
  pickupCity: z.string().max(80).nullable(),
  pickupState: z.string().max(32).nullable(),
  pickupZip: z.string().max(20).nullable(),
  deliveryCity: z.string().max(80).nullable(),
  deliveryState: z.string().max(32).nullable(),
  deliveryZip: z.string().max(20).nullable(),
  trailerType: z.string().max(80).nullable(),
  customerName: z.string().max(120).nullable(),
  customerPhone: z.string().max(40).nullable(),
  customerEmail: z.string().email().nullable(),
  firstAvailableDate: z.string().nullable(),
  pickupWindow: z.string().nullable(),
  deliveryWindow: z.string().nullable(),
  customerPrice: z.number().nonnegative().nullable(),
  carrierPay: z.number().nonnegative().nullable(),
  contactName: z.string().min(1).max(120),
  contactPhone: z.string().min(1).max(40),
});

const loadOpportunityStatusUpdateSchema = z.object({
  opportunityId: z.string().uuid(),
  status: z.enum(loadOpportunityStatuses),
});

const loadOpportunityNotesUpdateSchema = z.object({
  opportunityId: z.string().uuid(),
  notes: z.string().max(2000).nullable(),
});

const loadOpportunityAssignmentSchema = z.object({
  opportunityId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
});

const driverStatusUpdateSchema = z.object({
  driverId: z.string().uuid(),
  status: z.enum(driverStatuses),
});

const driverNotesUpdateSchema = z.object({
  driverId: z.string().uuid(),
  notes: z.string().max(2000).nullable(),
});

const driverProfileUpdateSchema = z.object({
  driverId: z.string().uuid(),
  assignedDispatcherEmail: z.string().email().nullable(),
  company: z.string().min(1).max(120),
  driverName: z.string().min(1).max(120),
  phone: z.string().min(1).refine((value) => value.replace(/\D/g, "").length >= 7),
  truckType: z.string().min(1).max(120),
  truckUnitNumber: z.string().max(60).nullable(),
  truckVin: z.string().length(17).nullable(),
  trailerUnitNumber: z.string().max(60).nullable(),
  trailerVin: z.string().length(17).nullable(),
  preferredLanes: z.string().max(240).nullable(),
  homeBase: z.string().min(1).max(120),
  currentLocation: z.string().max(160).nullable(),
  availableFrom: z.string().nullable(),
  capacity: z.number().int().positive().nullable(),
  status: z.enum(driverStatuses),
  notes: z.string().max(2000).nullable(),
});

const loadVehicleCreateSchema = z.object({
  loadId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100).nullable(),
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  vin: z.string().length(17).nullable(),
  lotNumber: z.string().max(80).nullable(),
  operability: z.enum(loadVehicleOperabilityStatuses),
});

const loadVehicleUpdateSchema = z.object({
  loadVehicleId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100).nullable(),
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  vin: z.string().length(17).nullable(),
  lotNumber: z.string().max(80).nullable(),
  operability: z.enum(loadVehicleOperabilityStatuses),
});

const loadVehicleDeleteSchema = z.object({
  loadVehicleId: z.string().uuid(),
});

const loadOpportunityVehicleCreateSchema = z.object({
  opportunityId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100).nullable(),
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  vin: z.string().length(17).nullable(),
  lotNumber: z.string().max(80).nullable(),
  operability: z.enum(loadVehicleOperabilityStatuses),
});

const loadOpportunityVehicleUpdateSchema = z.object({
  opportunityVehicleId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100).nullable(),
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  vin: z.string().length(17).nullable(),
  lotNumber: z.string().max(80).nullable(),
  operability: z.enum(loadVehicleOperabilityStatuses),
});

const loadOpportunityVehicleDeleteSchema = z.object({
  opportunityVehicleId: z.string().uuid(),
});

const problemFlagCreateSchema = z.object({
  entityType: z.enum(["load", "load_opportunity"]),
  entityId: z.string().uuid(),
  flagType: z.enum(problemFlagTypes),
  priority: z.enum(problemPriorityLevels),
  noteBody: z.string().min(1).max(2000),
});

const problemFlagResolveSchema = z.object({
  problemFlagId: z.string().uuid(),
});

type ActorContext = {
  actorEmail: string;
  actorRole: UserRole;
  canOverrideTransitions: boolean;
};

type MissingChecklistItem = {
  key: string;
  label: string;
};

function normalizeOptionalUuid(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalVin(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value).replace(/\s+/g, "").toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalDateTime(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function normalizeOptionalInteger(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function normalizeCheckboxValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "on" || normalized === "true" || normalized === "1";
}

function normalizeOptionalEmail(value: FormDataEntryValue | null) {
  const normalized = normalizeEmail(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalDispatcherEmail(value: FormDataEntryValue | null) {
  return normalizeOptionalEmail(value);
}

async function getActorContext(): Promise<ActorContext> {
  const session = await getDashboardSession();

  if (!session) {
    throw new Error("Dashboard session required.");
  }

  return {
    actorEmail: session.email,
    actorRole: session.role,
    canOverrideTransitions: canOverrideStatusTransitions(session),
  };
}

function resolveAssignedDispatcherEmail(
  requestedEmail: string | null,
  actor: ActorContext,
) {
  if (actor.actorRole === "dispatcher") {
    return actor.actorEmail.trim().toLowerCase();
  }

  if (!requestedEmail) {
    return null;
  }

  const normalizedEmail = requestedEmail.trim().toLowerCase();

  if (!getKnownDispatcherEmails().includes(normalizedEmail)) {
    throw new Error("Assigned dispatcher is not a valid internal account.");
  }

  return normalizedEmail;
}

async function requireDriverAccess(
  driverId: string,
  actor: ActorContext,
) {
  const driver = await getDriverById(driverId);

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (actor.actorRole === "admin") {
    return driver;
  }

  if (
    actor.actorRole === "dispatcher" &&
    driver.assignedDispatcherEmail?.trim().toLowerCase() ===
      actor.actorEmail.trim().toLowerCase()
  ) {
    return driver;
  }

  throw new Error("You do not have access to this driver.");
}

async function requireLoadAccess(
  loadId: string,
  actor: ActorContext,
) {
  const load = await getLoadById(loadId);

  if (!load) {
    throw new Error("Load not found.");
  }

  if (actor.actorRole === "admin") {
    return load;
  }

  if (!load.driverId) {
    throw new Error("You do not have access to unassigned loads.");
  }

  await requireDriverAccess(load.driverId, actor);
  return load;
}

async function requireOpportunityAccess(
  opportunityId: string,
  actor: ActorContext,
) {
  const opportunity = await getLoadOpportunityById(opportunityId);

  if (!opportunity) {
    throw new Error("Opportunity not found.");
  }

  if (actor.actorRole === "admin") {
    return opportunity;
  }

  if (!opportunity.assignedDriverId) {
    throw new Error("You do not have access to unassigned opportunities.");
  }

  await requireDriverAccess(opportunity.assignedDriverId, actor);
  return opportunity;
}

async function recordActivity(input: ActivityEventCreateInput) {
  try {
    await createActivityEvent(input);
  } catch (error) {
    console.error("[dispatch-activity] Failed to create activity event", {
      error: error instanceof Error ? error.message : "Unknown error",
      entityType: input.entityType,
      entityId: input.entityId,
      actionType: input.actionType,
    });
  }
}

async function recordEntityChange(params: {
  entityType: ActivityEntityType;
  entityId: string;
  actionType: ActivityActionType;
  noteBody?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}) {
  const actor = await getActorContext();

  await recordActivity({
    entityType: params.entityType,
    entityId: params.entityId,
    actionType: params.actionType,
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: params.noteBody ?? null,
    oldValue: params.oldValue ?? null,
    newValue: params.newValue ?? null,
  });
}

function hasValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function getOpportunityMissingChecklist(
  opportunity: LoadOpportunity,
  vehicles: LoadOpportunityVehicle[],
): MissingChecklistItem[] {
  const missing: MissingChecklistItem[] = [];

  if (!hasValue(opportunity.pickupCity)) {
    missing.push({ key: "pickup_city", label: "Pickup city" });
  }
  if (!hasValue(opportunity.pickupState)) {
    missing.push({ key: "pickup_state", label: "Pickup state" });
  }
  if (!hasValue(opportunity.pickupZip)) {
    missing.push({ key: "pickup_zip", label: "Pickup zip" });
  }
  if (!hasValue(opportunity.deliveryCity)) {
    missing.push({ key: "delivery_city", label: "Delivery city" });
  }
  if (!hasValue(opportunity.deliveryState)) {
    missing.push({ key: "delivery_state", label: "Delivery state" });
  }
  if (!hasValue(opportunity.deliveryZip)) {
    missing.push({ key: "delivery_zip", label: "Delivery zip" });
  }
  if (!hasValue(opportunity.firstAvailableDate)) {
    missing.push({ key: "first_available_date", label: "First available date" });
  }
  if (!hasValue(opportunity.trailerType)) {
    missing.push({ key: "trailer_type", label: "Trailer type" });
  }
  if (!hasValue(opportunity.customerName)) {
    missing.push({ key: "customer_name", label: "Customer name" });
  }
  if (!hasValue(opportunity.customerPhone)) {
    missing.push({ key: "customer_phone", label: "Customer phone" });
  }
  if (!hasValue(opportunity.customerEmail)) {
    missing.push({ key: "customer_email", label: "Customer email" });
  }
  if (!vehicles.length) {
    missing.push({ key: "vehicles", label: "At least one vehicle" });
  }

  vehicles.forEach((vehicle, index) => {
    const prefix = `vehicle_${index + 1}`;

    if (!hasValue(vehicle.year)) {
      missing.push({ key: `${prefix}_year`, label: `Vehicle ${index + 1} year` });
    }
    if (!hasValue(vehicle.make)) {
      missing.push({ key: `${prefix}_make`, label: `Vehicle ${index + 1} make` });
    }
    if (!hasValue(vehicle.model)) {
      missing.push({ key: `${prefix}_model`, label: `Vehicle ${index + 1} model` });
    }
    if (!hasValue(vehicle.operability)) {
      missing.push({
        key: `${prefix}_operability`,
        label: `Vehicle ${index + 1} operability`,
      });
    }
  });

  return missing;
}

export function getLoadMissingChecklist(load: Load): MissingChecklistItem[] {
  const missing: MissingChecklistItem[] = [];

  if (!hasValue(load.customerPrice)) {
    missing.push({ key: "customer_price", label: "Customer price" });
  }
  if (!hasValue(load.carrierPay)) {
    missing.push({ key: "carrier_pay", label: "Carrier / broker pay" });
  }
  if (!hasValue(load.broker) && !hasValue(load.carrierCompany)) {
    missing.push({
      key: "assigned_carrier_or_broker",
      label: "Assigned carrier or broker",
    });
  }
  if (!hasValue(load.pickupContactName)) {
    missing.push({ key: "pickup_contact_name", label: "Pickup contact name" });
  }
  if (!hasValue(load.pickupContactPhone)) {
    missing.push({ key: "pickup_contact_phone", label: "Pickup contact phone" });
  }
  if (!hasValue(load.deliveryContactName)) {
    missing.push({
      key: "delivery_contact_name",
      label: "Delivery contact name",
    });
  }
  if (!hasValue(load.deliveryContactPhone)) {
    missing.push({
      key: "delivery_contact_phone",
      label: "Delivery contact phone",
    });
  }

  return missing;
}

export function getLoadMarginSnapshot(load: Load, vehicleCount = 0) {
  const grossProfit =
    load.customerPrice !== null && load.carrierPay !== null
      ? load.customerPrice - load.carrierPay
      : null;
  const profitPerVehicle =
    grossProfit !== null && vehicleCount > 0
      ? grossProfit / vehicleCount
      : null;

  return {
    grossProfit,
    profitPerVehicle,
    isLowMargin: grossProfit !== null && grossProfit < 150,
  };
}

function ensureTransitionAllowed<TStatus extends string>(
  currentStatus: TStatus,
  nextStatus: TStatus,
  transitions: Record<TStatus, readonly TStatus[]>,
  actor: ActorContext,
  entityLabel: string,
) {
  if (currentStatus === nextStatus || actor.canOverrideTransitions) {
    return;
  }

  if (!transitions[currentStatus]?.includes(nextStatus)) {
    throw new Error(
      `Invalid ${entityLabel} status change from ${currentStatus.replaceAll("_", " ")} to ${nextStatus.replaceAll("_", " ")}.`,
    );
  }
}

function requireChecklistClear(
  checklist: MissingChecklistItem[],
  targetLabel: string,
) {
  if (!checklist.length) {
    return;
  }

  throw new Error(
    `Complete the required fields before moving to ${targetLabel}: ${checklist
      .map((item) => item.label)
      .join(", ")}.`,
  );
}

async function maybeSyncDriverStatusForLoad(load: Load) {
  if (!load.driverId) {
    return;
  }

  const nextDriverStatus: DriverStatus | null = (() => {
    switch (load.status) {
      case "assigned":
      case "pickup_scheduled":
        return "assigned";
      case "picked_up":
      case "in_transit":
        return "in_transit";
      case "delivered":
      case "closed":
        return "available";
      default:
        return null;
    }
  })();

  if (!nextDriverStatus) {
    return;
  }

  try {
    await updateDriverStatus(load.driverId, nextDriverStatus);
  } catch (error) {
    console.error("[dispatch-driver-sync] Failed to sync driver status", {
      error: error instanceof Error ? error.message : "Unknown error",
      driverId: load.driverId,
      loadId: load.id,
      loadStatus: load.status,
    });
  }
}

function parseDriverCreateInput(formData: FormData): DriverCreateInput {
  return {
    sourceLeadId: normalizeOptionalUuid(formData.get("sourceLeadId")),
    assignedDispatcherEmail: normalizeOptionalDispatcherEmail(
      formData.get("assignedDispatcherEmail"),
    ),
    company: normalizeText(formData.get("company")),
    driverName: normalizeText(formData.get("driverName")),
    phone: normalizePhone(formData.get("phone")),
    truckType: normalizeText(formData.get("truckType")),
    truckUnitNumber: normalizeOptionalText(formData.get("truckUnitNumber")),
    truckVin: normalizeOptionalVin(formData.get("truckVin")),
    trailerUnitNumber: normalizeOptionalText(formData.get("trailerUnitNumber")),
    trailerVin: normalizeOptionalVin(formData.get("trailerVin")),
    preferredLanes: normalizeOptionalText(formData.get("preferredLanes")),
    homeBase: normalizeText(formData.get("homeBase")),
    currentLocation: normalizeOptionalText(formData.get("currentLocation")),
    availableFrom: normalizeOptionalDateTime(formData.get("availableFrom")),
    capacity: normalizeOptionalInteger(formData.get("capacity")),
    status: (normalizeText(formData.get("status")) || "available") as DriverStatus,
    notes: normalizeOptionalText(formData.get("notes")),
  };
}

function parseLoadCreateInput(formData: FormData): LoadCreateInput {
  return {
    driverId: normalizeOptionalUuid(formData.get("driverId")),
    sourceLeadId: normalizeOptionalUuid(formData.get("sourceLeadId")),
    sourceOpportunityId: normalizeOptionalUuid(formData.get("sourceOpportunityId")),
    company: normalizeText(formData.get("company")),
    origin: normalizeText(formData.get("origin")),
    destination: normalizeText(formData.get("destination")),
    pickupCity: normalizeOptionalText(formData.get("pickupCity")),
    pickupState: normalizeOptionalText(formData.get("pickupState")),
    pickupZip: normalizeOptionalText(formData.get("pickupZip")),
    deliveryCity: normalizeOptionalText(formData.get("deliveryCity")),
    deliveryState: normalizeOptionalText(formData.get("deliveryState")),
    deliveryZip: normalizeOptionalText(formData.get("deliveryZip")),
    trailerType: normalizeOptionalText(formData.get("trailerType")),
    customerName: normalizeOptionalText(formData.get("customerName")),
    customerPhone: normalizeOptionalText(formData.get("customerPhone")),
    customerEmail: normalizeOptionalEmail(formData.get("customerEmail")),
    pickupDate: normalizeOptionalDateTime(formData.get("pickupDate")),
    deliveryDate: normalizeOptionalDateTime(formData.get("deliveryDate")),
    broker: normalizeText(formData.get("broker")),
    customerPrice: normalizeOptionalNumber(formData.get("customerPrice")),
    carrierPay: normalizeOptionalNumber(formData.get("carrierPay")),
    depositCollected: normalizeCheckboxValue(formData.get("depositCollected")),
    codAmount: normalizeOptionalNumber(formData.get("codAmount")),
    referenceNumber: normalizeText(formData.get("referenceNumber")),
    contactName: normalizeText(formData.get("contactName")),
    contactPhone: normalizePhone(formData.get("contactPhone")),
    pickupContactName: normalizeOptionalText(formData.get("pickupContactName")),
    pickupContactPhone: normalizeOptionalText(formData.get("pickupContactPhone")),
    deliveryContactName: normalizeOptionalText(formData.get("deliveryContactName")),
    deliveryContactPhone: normalizeOptionalText(formData.get("deliveryContactPhone")),
    carrierCompany: normalizeOptionalText(formData.get("carrierCompany")),
    carrierMcNumber: normalizeOptionalText(formData.get("carrierMcNumber")),
    carrierDispatcherName: normalizeOptionalText(
      formData.get("carrierDispatcherName"),
    ),
    carrierDispatcherPhone: normalizeOptionalText(
      formData.get("carrierDispatcherPhone"),
    ),
    carrierDriverName: normalizeOptionalText(formData.get("carrierDriverName")),
    carrierDriverPhone: normalizeOptionalText(formData.get("carrierDriverPhone")),
    truckTrailerType: normalizeOptionalText(formData.get("truckTrailerType")),
    rate: normalizeOptionalNumber(formData.get("rate")) as number,
    status: (normalizeText(formData.get("status")) || "posted") as DispatchLoadStatus,
    notes: normalizeOptionalText(formData.get("notes")),
  };
}

function parseLoadOperationalUpdateInput(formData: FormData): LoadOperationalUpdateInput {
  return {
    loadId: normalizeText(formData.get("loadId")),
    pickupCity: normalizeOptionalText(formData.get("pickupCity")),
    pickupState: normalizeOptionalText(formData.get("pickupState")),
    pickupZip: normalizeOptionalText(formData.get("pickupZip")),
    deliveryCity: normalizeOptionalText(formData.get("deliveryCity")),
    deliveryState: normalizeOptionalText(formData.get("deliveryState")),
    deliveryZip: normalizeOptionalText(formData.get("deliveryZip")),
    trailerType: normalizeOptionalText(formData.get("trailerType")),
    customerName: normalizeOptionalText(formData.get("customerName")),
    customerPhone: normalizeOptionalText(formData.get("customerPhone")),
    customerEmail: normalizeOptionalEmail(formData.get("customerEmail")),
    pickupDate: normalizeOptionalDateTime(formData.get("pickupDate")),
    deliveryDate: normalizeOptionalDateTime(formData.get("deliveryDate")),
    customerPrice: normalizeOptionalNumber(formData.get("customerPrice")),
    carrierPay: normalizeOptionalNumber(formData.get("carrierPay")),
    depositCollected: normalizeCheckboxValue(formData.get("depositCollected")),
    codAmount: normalizeOptionalNumber(formData.get("codAmount")),
    referenceNumber: normalizeText(formData.get("referenceNumber")),
    contactName: normalizeText(formData.get("contactName")),
    contactPhone: normalizePhone(formData.get("contactPhone")),
    pickupContactName: normalizeOptionalText(formData.get("pickupContactName")),
    pickupContactPhone: normalizeOptionalText(formData.get("pickupContactPhone")),
    deliveryContactName: normalizeOptionalText(formData.get("deliveryContactName")),
    deliveryContactPhone: normalizeOptionalText(formData.get("deliveryContactPhone")),
    carrierCompany: normalizeOptionalText(formData.get("carrierCompany")),
    carrierMcNumber: normalizeOptionalText(formData.get("carrierMcNumber")),
    carrierDispatcherName: normalizeOptionalText(
      formData.get("carrierDispatcherName"),
    ),
    carrierDispatcherPhone: normalizeOptionalText(
      formData.get("carrierDispatcherPhone"),
    ),
    carrierDriverName: normalizeOptionalText(formData.get("carrierDriverName")),
    carrierDriverPhone: normalizeOptionalText(formData.get("carrierDriverPhone")),
    truckTrailerType: normalizeOptionalText(formData.get("truckTrailerType")),
  };
}

function parseLoadOpportunityCreateInput(formData: FormData): LoadOpportunityCreateInput {
  return {
    source: normalizeText(formData.get("source")),
    sourceUrl: normalizeOptionalText(formData.get("sourceUrl")),
    sourceReference: normalizeText(formData.get("sourceReference")),
    company: normalizeOptionalText(formData.get("company")),
    origin: normalizeText(formData.get("origin")),
    destination: normalizeText(formData.get("destination")),
    pickupCity: normalizeOptionalText(formData.get("pickupCity")),
    pickupState: normalizeOptionalText(formData.get("pickupState")),
    pickupZip: normalizeOptionalText(formData.get("pickupZip")),
    deliveryCity: normalizeOptionalText(formData.get("deliveryCity")),
    deliveryState: normalizeOptionalText(formData.get("deliveryState")),
    deliveryZip: normalizeOptionalText(formData.get("deliveryZip")),
    trailerType: normalizeOptionalText(formData.get("trailerType")),
    customerName: normalizeOptionalText(formData.get("customerName")),
    customerPhone: normalizeOptionalText(formData.get("customerPhone")),
    customerEmail: normalizeOptionalEmail(formData.get("customerEmail")),
    firstAvailableDate: normalizeOptionalDateTime(formData.get("firstAvailableDate")),
    pickupWindow: normalizeOptionalDateTime(formData.get("pickupWindow")),
    deliveryWindow: normalizeOptionalDateTime(formData.get("deliveryWindow")),
    vehiclesCount: normalizeOptionalInteger(formData.get("vehiclesCount")) ?? 1,
    customerPrice: normalizeOptionalNumber(formData.get("customerPrice")),
    carrierPay: normalizeOptionalNumber(formData.get("carrierPay")),
    rate: normalizeOptionalNumber(formData.get("rate")),
    contactName: normalizeText(formData.get("contactName")),
    contactPhone: normalizePhone(formData.get("contactPhone")),
    status: (normalizeText(formData.get("status")) ||
      "new") as LoadOpportunityStatus,
    assignedDriverId: normalizeOptionalUuid(formData.get("assignedDriverId")),
    notes: normalizeOptionalText(formData.get("notes")),
  };
}

function parseLoadOpportunityOperationalUpdateInput(
  formData: FormData,
): LoadOpportunityOperationalUpdateInput {
  return {
    opportunityId: normalizeText(formData.get("opportunityId")),
    sourceReference: normalizeText(formData.get("sourceReference")),
    pickupCity: normalizeOptionalText(formData.get("pickupCity")),
    pickupState: normalizeOptionalText(formData.get("pickupState")),
    pickupZip: normalizeOptionalText(formData.get("pickupZip")),
    deliveryCity: normalizeOptionalText(formData.get("deliveryCity")),
    deliveryState: normalizeOptionalText(formData.get("deliveryState")),
    deliveryZip: normalizeOptionalText(formData.get("deliveryZip")),
    trailerType: normalizeOptionalText(formData.get("trailerType")),
    customerName: normalizeOptionalText(formData.get("customerName")),
    customerPhone: normalizeOptionalText(formData.get("customerPhone")),
    customerEmail: normalizeOptionalEmail(formData.get("customerEmail")),
    firstAvailableDate: normalizeOptionalDateTime(formData.get("firstAvailableDate")),
    pickupWindow: normalizeOptionalDateTime(formData.get("pickupWindow")),
    deliveryWindow: normalizeOptionalDateTime(formData.get("deliveryWindow")),
    customerPrice: normalizeOptionalNumber(formData.get("customerPrice")),
    carrierPay: normalizeOptionalNumber(formData.get("carrierPay")),
    contactName: normalizeText(formData.get("contactName")),
    contactPhone: normalizePhone(formData.get("contactPhone")),
  };
}

function parseOpportunityVehicleInputs(formData: FormData) {
  const years = formData.getAll("vehicleYear");
  const makes = formData.getAll("vehicleMake");
  const models = formData.getAll("vehicleModel");
  const vins = formData.getAll("vehicleVin");
  const lotNumbers = formData.getAll("vehicleLotNumber");
  const operabilities = formData.getAll("vehicleOperability");

  const totalRows = Math.max(
    years.length,
    makes.length,
    models.length,
    vins.length,
    lotNumbers.length,
    operabilities.length,
  );

  return Array.from({ length: totalRows }, (_, index) => ({
    year: normalizeOptionalInteger(years[index] ?? null),
    make: normalizeText(makes[index] ?? null),
    model: normalizeText(models[index] ?? null),
    vin: normalizeOptionalVin(vins[index] ?? null),
    lotNumber: normalizeOptionalText(lotNumbers[index] ?? null),
    operability: (normalizeText(operabilities[index] ?? null) ||
      "operable") as LoadVehicleOperabilityStatus,
  })).filter((vehicle) => vehicle.make || vehicle.model || vehicle.vin || vehicle.year);
}

function parseLoadVehicleCreateInput(formData: FormData): LoadVehicleCreateInput {
  return {
    loadId: normalizeText(formData.get("loadId")),
    year: normalizeOptionalInteger(formData.get("year")),
    make: normalizeText(formData.get("make")),
    model: normalizeText(formData.get("model")),
    vin: normalizeOptionalVin(formData.get("vin")),
    lotNumber: normalizeOptionalText(formData.get("lotNumber")),
    operability: (normalizeText(formData.get("operability")) ||
      "operable") as LoadVehicleOperabilityStatus,
  };
}

function parseLoadVehicleUpdateInput(formData: FormData): LoadVehicleUpdateInput {
  return {
    loadVehicleId: normalizeText(formData.get("loadVehicleId")),
    year: normalizeOptionalInteger(formData.get("year")),
    make: normalizeText(formData.get("make")),
    model: normalizeText(formData.get("model")),
    vin: normalizeOptionalVin(formData.get("vin")),
    lotNumber: normalizeOptionalText(formData.get("lotNumber")),
    operability: (normalizeText(formData.get("operability")) ||
      "operable") as LoadVehicleOperabilityStatus,
  };
}

function parseLoadOpportunityVehicleCreateInput(
  formData: FormData,
): LoadOpportunityVehicleCreateInput {
  return {
    opportunityId: normalizeText(formData.get("opportunityId")),
    year: normalizeOptionalInteger(formData.get("year")),
    make: normalizeText(formData.get("make")),
    model: normalizeText(formData.get("model")),
    vin: normalizeOptionalVin(formData.get("vin")),
    lotNumber: normalizeOptionalText(formData.get("lotNumber")),
    operability: (normalizeText(formData.get("operability")) ||
      "operable") as LoadVehicleOperabilityStatus,
  };
}

function parseLoadOpportunityVehicleUpdateInput(
  formData: FormData,
): LoadOpportunityVehicleUpdateInput {
  return {
    opportunityVehicleId: normalizeText(formData.get("opportunityVehicleId")),
    year: normalizeOptionalInteger(formData.get("year")),
    make: normalizeText(formData.get("make")),
    model: normalizeText(formData.get("model")),
    vin: normalizeOptionalVin(formData.get("vin")),
    lotNumber: normalizeOptionalText(formData.get("lotNumber")),
    operability: (normalizeText(formData.get("operability")) ||
      "operable") as LoadVehicleOperabilityStatus,
  };
}

function mergeOpportunityIntoLoadInput(
  input: LoadCreateInput,
  opportunity: LoadOpportunity | null,
): LoadCreateInput {
  if (!opportunity) {
    return input;
  }

  return {
    ...input,
    pickupCity: input.pickupCity ?? opportunity.pickupCity,
    pickupState: input.pickupState ?? opportunity.pickupState,
    pickupZip: input.pickupZip ?? opportunity.pickupZip,
    deliveryCity: input.deliveryCity ?? opportunity.deliveryCity,
    deliveryState: input.deliveryState ?? opportunity.deliveryState,
    deliveryZip: input.deliveryZip ?? opportunity.deliveryZip,
    trailerType: input.trailerType ?? opportunity.trailerType,
    customerName: input.customerName ?? opportunity.customerName,
    customerPhone: input.customerPhone ?? opportunity.customerPhone,
    customerEmail: input.customerEmail ?? opportunity.customerEmail,
    pickupDate: input.pickupDate ?? opportunity.pickupWindow,
    deliveryDate: input.deliveryDate ?? opportunity.deliveryWindow,
    customerPrice: input.customerPrice ?? opportunity.customerPrice,
    carrierPay: input.carrierPay ?? opportunity.carrierPay,
    referenceNumber:
      input.referenceNumber || opportunity.sourceReference || input.referenceNumber,
    contactName: input.contactName || opportunity.contactName || input.contactName,
    contactPhone:
      input.contactPhone || opportunity.contactPhone || input.contactPhone,
    notes: input.notes ?? opportunity.notes,
  };
}

function isPricingChange(
  previous: Pick<Load, "customerPrice" | "carrierPay" | "codAmount"> |
    Pick<LoadOpportunity, "customerPrice" | "carrierPay">,
  next: Pick<Load, "customerPrice" | "carrierPay" | "codAmount"> |
    Pick<LoadOpportunity, "customerPrice" | "carrierPay">,
) {
  return (
    previous.customerPrice !== next.customerPrice ||
    previous.carrierPay !== next.carrierPay ||
    ("codAmount" in previous ? previous.codAmount : null) !==
      ("codAmount" in next ? next.codAmount : null)
  );
}

function isScheduleChange(
  previous: {
    pickupDate?: string | null;
    deliveryDate?: string | null;
    pickupWindow?: string | null;
    deliveryWindow?: string | null;
    firstAvailableDate?: string | null;
  },
  next: {
    pickupDate?: string | null;
    deliveryDate?: string | null;
    pickupWindow?: string | null;
    deliveryWindow?: string | null;
    firstAvailableDate?: string | null;
  },
) {
  return (
    previous.pickupDate !== next.pickupDate ||
    previous.deliveryDate !== next.deliveryDate ||
    previous.pickupWindow !== next.pickupWindow ||
    previous.deliveryWindow !== next.deliveryWindow ||
    previous.firstAvailableDate !== next.firstAvailableDate
  );
}

export async function createDriverFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = driverCreateSchema.safeParse(parseDriverCreateInput(formData));

  if (!validation.success) {
    throw new Error("Invalid driver request.");
  }

  return createDriver({
    ...validation.data,
    assignedDispatcherEmail: resolveAssignedDispatcherEmail(
      validation.data.assignedDispatcherEmail,
      actor,
    ),
  });
}

export async function updateDriverStatusFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = driverStatusUpdateSchema.safeParse({
    driverId: normalizeText(formData.get("driverId")),
    status: normalizeText(formData.get("status")),
  });

  if (!validation.success) {
    throw new Error("Invalid driver status request.");
  }

  await requireDriverAccess(validation.data.driverId, actor);

  const driver = await updateDriverStatus(
    validation.data.driverId,
    validation.data.status,
  );
  return driver;
}

export async function updateDriverMovementFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = driverMovementUpdateSchema.safeParse({
    driverId: normalizeText(formData.get("driverId")),
    assignedDispatcherEmail: normalizeOptionalDispatcherEmail(
      formData.get("assignedDispatcherEmail"),
    ),
    truckUnitNumber: normalizeOptionalText(formData.get("truckUnitNumber")),
    truckVin: normalizeOptionalVin(formData.get("truckVin")),
    trailerUnitNumber: normalizeOptionalText(formData.get("trailerUnitNumber")),
    trailerVin: normalizeOptionalVin(formData.get("trailerVin")),
    currentLocation: normalizeOptionalText(formData.get("currentLocation")),
    availableFrom: normalizeOptionalDateTime(formData.get("availableFrom")),
    capacity: normalizeOptionalInteger(formData.get("capacity")),
  });

  if (!validation.success) {
    throw new Error("Invalid driver movement request.");
  }

  await requireDriverAccess(validation.data.driverId, actor);

  const driver = await updateDriverMovement({
    ...validation.data,
    assignedDispatcherEmail: resolveAssignedDispatcherEmail(
      validation.data.assignedDispatcherEmail,
      actor,
    ),
  });

  return driver;
}

export async function updateDriverNotesFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = driverNotesUpdateSchema.safeParse({
    driverId: normalizeText(formData.get("driverId")),
    notes: normalizeOptionalText(formData.get("notes")),
  });

  if (!validation.success) {
    throw new Error("Invalid driver notes request.");
  }

  await requireDriverAccess(validation.data.driverId, actor);

  return updateDriverNotes(validation.data);
}

export async function updateDriverProfileFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = driverProfileUpdateSchema.safeParse({
    driverId: normalizeText(formData.get("driverId")),
    assignedDispatcherEmail: normalizeOptionalDispatcherEmail(
      formData.get("assignedDispatcherEmail"),
    ),
    company: normalizeText(formData.get("company")),
    driverName: normalizeText(formData.get("driverName")),
    phone: normalizePhone(formData.get("phone")),
    truckType: normalizeText(formData.get("truckType")),
    truckUnitNumber: normalizeOptionalText(formData.get("truckUnitNumber")),
    truckVin: normalizeOptionalVin(formData.get("truckVin")),
    trailerUnitNumber: normalizeOptionalText(formData.get("trailerUnitNumber")),
    trailerVin: normalizeOptionalVin(formData.get("trailerVin")),
    preferredLanes: normalizeOptionalText(formData.get("preferredLanes")),
    homeBase: normalizeText(formData.get("homeBase")),
    currentLocation: normalizeOptionalText(formData.get("currentLocation")),
    availableFrom: normalizeOptionalDateTime(formData.get("availableFrom")),
    capacity: normalizeOptionalInteger(formData.get("capacity")),
    status: normalizeText(formData.get("status")),
    notes: normalizeOptionalText(formData.get("notes")),
  });

  if (!validation.success) {
    throw new Error("Invalid driver profile request.");
  }

  await requireDriverAccess(validation.data.driverId, actor);

  return updateDriverProfile({
    ...validation.data,
    assignedDispatcherEmail: resolveAssignedDispatcherEmail(
      validation.data.assignedDispatcherEmail,
      actor,
    ),
  });
}

export async function convertLeadToDriverFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = leadToDriverConversionSchema.safeParse({
    leadId: normalizeText(formData.get("leadId")),
    company: normalizeText(formData.get("company")),
    homeBase: normalizeText(formData.get("homeBase")),
    assignedDispatcherEmail: normalizeOptionalDispatcherEmail(
      formData.get("assignedDispatcherEmail"),
    ),
  });

  if (!validation.success) {
    throw new Error("Invalid lead conversion request.");
  }

  const lead = await getLeadById(validation.data.leadId);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const existingDriver = await getDriverBySourceLeadId(lead.id);

  if (existingDriver) {
    await updateLeadActivity({
      leadId: lead.id,
      status: "onboarded",
      notes: lead.notes,
    });

    return {
      leadId: lead.id,
      driverId: existingDriver.id,
    };
  }

  const driver = await createDriver({
    sourceLeadId: lead.id,
    assignedDispatcherEmail: resolveAssignedDispatcherEmail(
      (validation.data as { assignedDispatcherEmail?: string | null })
        .assignedDispatcherEmail ?? null,
      actor,
    ),
    company: validation.data.company,
    driverName: `${lead.firstName} ${lead.lastName}`.trim(),
    phone: lead.phone,
    truckType: lead.truckType,
    truckUnitNumber: null,
    truckVin: null,
    trailerUnitNumber: null,
    trailerVin: null,
    preferredLanes: lead.preferredLanes,
    homeBase: validation.data.homeBase,
    currentLocation: null,
    availableFrom: null,
    capacity: null,
    status: "available",
    notes: lead.notes,
  });

  await updateLeadActivity({
    leadId: lead.id,
    status: "onboarded",
    notes: lead.notes,
  });

  return {
    leadId: lead.id,
    driverId: driver.id,
  };
}

export async function createLoadFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const rawInput = parseLoadCreateInput(formData);
  const opportunity = rawInput.sourceOpportunityId
    ? await requireOpportunityAccess(rawInput.sourceOpportunityId, actor)
    : null;

  if (rawInput.driverId) {
    await requireDriverAccess(rawInput.driverId, actor);
  } else if (actor.actorRole === "dispatcher") {
    throw new Error("Dispatchers can only create loads for assigned drivers.");
  }

  const preparedInput = mergeOpportunityIntoLoadInput(rawInput, opportunity);
  const validation = loadCreateSchema.safeParse(preparedInput);

  if (!validation.success) {
    throw new Error("Invalid load request.");
  }

  const load = await createLoad(validation.data);

  await recordActivity({
    entityType: "load",
    entityId: load.id,
    actionType: "record_created",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: `Created load ${load.referenceNumber ?? load.id}.`,
    oldValue: null,
    newValue: {
      status: load.status,
      driverId: load.driverId,
      sourceOpportunityId: load.sourceOpportunityId,
    },
  });

  if (opportunity) {
    const opportunityVehicles = await listLoadOpportunityVehiclesByOpportunityId(
      opportunity.id,
    );

    const vehicleResults = await Promise.allSettled(
      opportunityVehicles.map((vehicle) =>
        createLoadVehicle({
          loadId: load.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          lotNumber: vehicle.lotNumber,
          operability: vehicle.operability,
        }),
      ),
    );

    for (const result of vehicleResults) {
      if (result.status === "rejected") {
        console.error("[dispatch-load] Failed to carry opportunity vehicle", {
          loadId: load.id,
          opportunityId: opportunity.id,
          error: result.reason instanceof Error ? result.reason.message : "Unknown error",
        });
      }
    }

    const previousStatus = opportunity.status;
    await updateLoadOpportunityStatus(opportunity.id, "closed_won");
    await assignLoadOpportunityToDriver({
      opportunityId: opportunity.id,
      driverId: load.driverId,
    });
    await recordActivity({
      entityType: "load_opportunity",
      entityId: opportunity.id,
      actionType: "status_changed",
      actorEmail: actor.actorEmail,
      actorRole: actor.actorRole,
      noteBody: `Converted to load ${load.referenceNumber ?? load.id}.`,
      oldValue: { status: previousStatus },
      newValue: { status: "closed_won", loadId: load.id },
    });
  }

  await maybeSyncDriverStatusForLoad(load);

  return load;
}

export async function updateLoadStatusFromFormData(formData: FormData) {
  const validation = loadStatusUpdateSchema.safeParse({
    loadId: normalizeText(formData.get("loadId")),
    status: normalizeText(formData.get("status")),
  });

  if (!validation.success) {
    throw new Error("Invalid load status request.");
  }

  const actor = await getActorContext();
  const existing = await requireLoadAccess(validation.data.loadId, actor);

  ensureTransitionAllowed(
    existing.status,
    validation.data.status,
    loadStatusTransitions,
    actor,
    "load",
  );

  if (validation.data.status === "booked") {
    requireChecklistClear(getLoadMissingChecklist(existing), "Booked");
  }

  if (
    ["assigned", "pickup_scheduled", "picked_up", "in_transit"].includes(
      validation.data.status,
    ) &&
    !existing.driverId
  ) {
    throw new Error(
      "Assign a driver before moving this load into execution statuses.",
    );
  }

  const updated = await updateLoadStatus(validation.data.loadId, validation.data.status);

  await recordActivity({
    entityType: "load",
    entityId: updated.id,
    actionType: "status_changed",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: null,
    oldValue: { status: existing.status },
    newValue: { status: updated.status },
  });

  await maybeSyncDriverStatusForLoad(updated);

  return updated;
}

export async function updateLoadNotesFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = loadNotesUpdateSchema.safeParse({
    loadId: normalizeText(formData.get("loadId")),
    notes: normalizeOptionalText(formData.get("notes")),
  });

  if (!validation.success) {
    throw new Error("Invalid load notes request.");
  }

  const existing = await requireLoadAccess(validation.data.loadId, actor);

  const updated = await updateLoadNotes(validation.data);

  await recordEntityChange({
    entityType: "load",
    entityId: updated.id,
    actionType: "notes_saved",
    noteBody: updated.notes,
    oldValue: { notes: existing.notes },
    newValue: { notes: updated.notes },
  });

  return updated;
}

export async function updateLoadOperationalFromFormData(formData: FormData) {
  const validation = loadOperationalUpdateSchema.safeParse(
    parseLoadOperationalUpdateInput(formData),
  );

  if (!validation.success) {
    throw new Error("Invalid load details request.");
  }

  const actor = await getActorContext();
  const existing = await requireLoadAccess(validation.data.loadId, actor);

  const updated = await updateLoadOperationalDetails(validation.data);

  await recordActivity({
    entityType: "load",
    entityId: updated.id,
    actionType: "details_updated",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: null,
    oldValue: {
      referenceNumber: existing.referenceNumber,
      customerName: existing.customerName,
      pickupDate: existing.pickupDate,
      deliveryDate: existing.deliveryDate,
    },
    newValue: {
      referenceNumber: updated.referenceNumber,
      customerName: updated.customerName,
      pickupDate: updated.pickupDate,
      deliveryDate: updated.deliveryDate,
    },
  });

  if (isPricingChange(existing, updated)) {
    await recordActivity({
      entityType: "load",
      entityId: updated.id,
      actionType: "pricing_updated",
      actorEmail: actor.actorEmail,
      actorRole: actor.actorRole,
      noteBody: null,
      oldValue: {
        customerPrice: existing.customerPrice,
        carrierPay: existing.carrierPay,
        codAmount: existing.codAmount,
      },
      newValue: {
        customerPrice: updated.customerPrice,
        carrierPay: updated.carrierPay,
        codAmount: updated.codAmount,
      },
    });
  }

  if (isScheduleChange(existing, updated)) {
    await recordActivity({
      entityType: "load",
      entityId: updated.id,
      actionType: "schedule_updated",
      actorEmail: actor.actorEmail,
      actorRole: actor.actorRole,
      noteBody: null,
      oldValue: {
        pickupDate: existing.pickupDate,
        deliveryDate: existing.deliveryDate,
      },
      newValue: {
        pickupDate: updated.pickupDate,
        deliveryDate: updated.deliveryDate,
      },
    });
  }

  return updated;
}

export async function createLoadOpportunityFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = loadOpportunityCreateSchema.safeParse(
    parseLoadOpportunityCreateInput(formData),
  );
  const vehicleValidation = z
    .array(opportunityVehicleDraftSchema)
    .min(1, "Add at least one vehicle.")
    .safeParse(parseOpportunityVehicleInputs(formData));

  if (!validation.success) {
    throw new Error("Invalid opportunity request.");
  }

  if (!vehicleValidation.success) {
    throw new Error("Add at least one complete vehicle before saving.");
  }

  const vehiclesCount = vehicleValidation.data.length;
  const opportunityValidation = loadOpportunityCreateSchema.safeParse({
    ...validation.data,
    vehiclesCount,
  });

  if (!opportunityValidation.success) {
    throw new Error("Invalid opportunity request.");
  }

  if (opportunityValidation.data.assignedDriverId) {
    await requireDriverAccess(opportunityValidation.data.assignedDriverId, actor);
  } else if (actor.actorRole === "dispatcher") {
    throw new Error("Dispatchers can only create opportunities for assigned drivers.");
  }

  const opportunity = await createLoadOpportunity(opportunityValidation.data);

  const createdVehicles = await Promise.all(
    vehicleValidation.data.map((vehicleInput) =>
      createLoadOpportunityVehicle({
        opportunityId: opportunity.id,
        year: vehicleInput.year,
        make: vehicleInput.make,
        model: vehicleInput.model,
        vin: vehicleInput.vin,
        lotNumber: vehicleInput.lotNumber,
        operability: vehicleInput.operability,
      }),
    ),
  );

  await recordActivity({
    entityType: "load_opportunity",
    entityId: opportunity.id,
    actionType: "record_created",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: `Created ${opportunity.source} opportunity.`,
    oldValue: null,
    newValue: {
      status: opportunity.status,
      assignedDriverId: opportunity.assignedDriverId,
      vehiclesCount,
    },
  });

  for (const vehicle of createdVehicles) {
    await recordActivity({
      entityType: "load_opportunity",
      entityId: opportunity.id,
      actionType: "vehicle_added",
      actorEmail: actor.actorEmail,
      actorRole: actor.actorRole,
      noteBody: `${vehicle.year ?? "Year TBD"} ${vehicle.make} ${vehicle.model}`.trim(),
      oldValue: null,
      newValue: {
        opportunityVehicleId: vehicle.id,
        vin: vehicle.vin,
        lotNumber: vehicle.lotNumber,
      },
    });
  }

  return opportunity;
}

export async function updateLoadOpportunityStatusFromFormData(formData: FormData) {
  const validation = loadOpportunityStatusUpdateSchema.safeParse({
    opportunityId: normalizeText(formData.get("opportunityId")),
    status: normalizeText(formData.get("status")),
  });

  if (!validation.success) {
    throw new Error("Invalid opportunity status request.");
  }

  const actor = await getActorContext();
  const existing = await requireOpportunityAccess(validation.data.opportunityId, actor);

  ensureTransitionAllowed(
    existing.status,
    validation.data.status,
    opportunityStatusTransitions,
    actor,
    "opportunity",
  );

  if (validation.data.status === "ready_to_post") {
    const vehicles = await listLoadOpportunityVehiclesByOpportunityId(existing.id);
    requireChecklistClear(
      getOpportunityMissingChecklist(existing, vehicles),
      "Ready to Post",
    );
  }

  const updated = await updateLoadOpportunityStatus(
    validation.data.opportunityId,
    validation.data.status,
  );

  await recordActivity({
    entityType: "load_opportunity",
    entityId: updated.id,
    actionType: "status_changed",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: null,
    oldValue: { status: existing.status },
    newValue: { status: updated.status },
  });

  return updated;
}

export async function updateLoadOpportunityNotesFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = loadOpportunityNotesUpdateSchema.safeParse({
    opportunityId: normalizeText(formData.get("opportunityId")),
    notes: normalizeOptionalText(formData.get("notes")),
  });

  if (!validation.success) {
    throw new Error("Invalid opportunity notes request.");
  }

  const existing = await requireOpportunityAccess(
    validation.data.opportunityId,
    actor,
  );

  const updated = await updateLoadOpportunityNotes(validation.data);

  await recordEntityChange({
    entityType: "load_opportunity",
    entityId: updated.id,
    actionType: "notes_saved",
    noteBody: updated.notes,
    oldValue: { notes: existing.notes },
    newValue: { notes: updated.notes },
  });

  return updated;
}

export async function updateLoadOpportunityOperationalFromFormData(
  formData: FormData,
) {
  const validation = loadOpportunityOperationalUpdateSchema.safeParse(
    parseLoadOpportunityOperationalUpdateInput(formData),
  );

  if (!validation.success) {
    throw new Error("Invalid opportunity details request.");
  }

  const actor = await getActorContext();
  const existing = await requireOpportunityAccess(
    validation.data.opportunityId,
    actor,
  );

  const updated = await updateLoadOpportunityOperationalDetails(validation.data);

  await recordActivity({
    entityType: "load_opportunity",
    entityId: updated.id,
    actionType: "details_updated",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: null,
    oldValue: {
      sourceReference: existing.sourceReference,
      customerName: existing.customerName,
      pickupWindow: existing.pickupWindow,
      deliveryWindow: existing.deliveryWindow,
    },
    newValue: {
      sourceReference: updated.sourceReference,
      customerName: updated.customerName,
      pickupWindow: updated.pickupWindow,
      deliveryWindow: updated.deliveryWindow,
    },
  });

  if (isPricingChange(existing, updated)) {
    await recordActivity({
      entityType: "load_opportunity",
      entityId: updated.id,
      actionType: "pricing_updated",
      actorEmail: actor.actorEmail,
      actorRole: actor.actorRole,
      noteBody: null,
      oldValue: {
        customerPrice: existing.customerPrice,
        carrierPay: existing.carrierPay,
      },
      newValue: {
        customerPrice: updated.customerPrice,
        carrierPay: updated.carrierPay,
      },
    });
  }

  if (isScheduleChange(existing, updated)) {
    await recordActivity({
      entityType: "load_opportunity",
      entityId: updated.id,
      actionType: "schedule_updated",
      actorEmail: actor.actorEmail,
      actorRole: actor.actorRole,
      noteBody: null,
      oldValue: {
        firstAvailableDate: existing.firstAvailableDate,
        pickupWindow: existing.pickupWindow,
        deliveryWindow: existing.deliveryWindow,
      },
      newValue: {
        firstAvailableDate: updated.firstAvailableDate,
        pickupWindow: updated.pickupWindow,
        deliveryWindow: updated.deliveryWindow,
      },
    });
  }

  return updated;
}

export async function assignLoadOpportunityToDriverFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = loadOpportunityAssignmentSchema.safeParse({
    opportunityId: normalizeText(formData.get("opportunityId")),
    driverId: normalizeOptionalUuid(formData.get("driverId")),
  });

  if (!validation.success) {
    throw new Error("Invalid opportunity assignment request.");
  }

  const existing = await requireOpportunityAccess(
    validation.data.opportunityId,
    actor,
  );

  if (validation.data.driverId) {
    await requireDriverAccess(validation.data.driverId, actor);
  } else if (actor.actorRole === "dispatcher") {
    throw new Error("Dispatchers cannot leave opportunities unassigned.");
  }

  const updated = await assignLoadOpportunityToDriver(validation.data);

  await recordEntityChange({
    entityType: "load_opportunity",
    entityId: updated.id,
    actionType: "assignment_updated",
    noteBody: null,
    oldValue: { assignedDriverId: existing.assignedDriverId },
    newValue: { assignedDriverId: updated.assignedDriverId },
  });

  return updated;
}

export async function assignLoadToDriverFromFormData(formData: FormData) {
  const actor = await getActorContext();
  const validation = loadAssignmentSchema.safeParse({
    loadId: normalizeText(formData.get("loadId")),
    driverId: normalizeOptionalUuid(formData.get("driverId")),
  });

  if (!validation.success) {
    throw new Error("Invalid load assignment request.");
  }

  const existing = await requireLoadAccess(validation.data.loadId, actor);

  if (validation.data.driverId) {
    await requireDriverAccess(validation.data.driverId, actor);
  } else if (actor.actorRole === "dispatcher") {
    throw new Error("Dispatchers cannot leave loads unassigned.");
  }

  const updated = await assignLoadToDriver(validation.data.loadId, validation.data.driverId);

  await recordEntityChange({
    entityType: "load",
    entityId: updated.id,
    actionType: "assignment_updated",
    noteBody: null,
    oldValue: { driverId: existing.driverId },
    newValue: { driverId: updated.driverId },
  });

  await maybeSyncDriverStatusForLoad(updated);

  return updated;
}

export async function createLoadVehicleFromFormData(formData: FormData) {
  const validation = loadVehicleCreateSchema.safeParse(
    parseLoadVehicleCreateInput(formData),
  );

  if (!validation.success) {
    throw new Error("Invalid vehicle request.");
  }

  const vehicle = await createLoadVehicle(validation.data);

  await recordEntityChange({
    entityType: "load",
    entityId: vehicle.loadId,
    actionType: "vehicle_added",
    noteBody: `${vehicle.year ?? "Year TBD"} ${vehicle.make} ${vehicle.model}`.trim(),
    newValue: {
      loadVehicleId: vehicle.id,
      vin: vehicle.vin,
      lotNumber: vehicle.lotNumber,
    },
  });

  return vehicle;
}

export async function updateLoadVehicleFromFormData(formData: FormData) {
  const validation = loadVehicleUpdateSchema.safeParse(
    parseLoadVehicleUpdateInput(formData),
  );

  if (!validation.success) {
    throw new Error("Invalid vehicle update request.");
  }

  const vehicle = await updateLoadVehicle(validation.data);

  await recordEntityChange({
    entityType: "load",
    entityId: vehicle.loadId,
    actionType: "vehicle_updated",
    noteBody: `${vehicle.year ?? "Year TBD"} ${vehicle.make} ${vehicle.model}`.trim(),
    newValue: {
      loadVehicleId: vehicle.id,
      vin: vehicle.vin,
      lotNumber: vehicle.lotNumber,
    },
  });

  return vehicle;
}

export async function deleteLoadVehicleFromFormData(formData: FormData) {
  const validation = loadVehicleDeleteSchema.safeParse({
    loadVehicleId: normalizeText(formData.get("loadVehicleId")),
  });

  if (!validation.success) {
    throw new Error("Invalid vehicle delete request.");
  }

  await deleteLoadVehicle(validation.data.loadVehicleId);
}

export async function createLoadOpportunityVehicleFromFormData(formData: FormData) {
  const validation = loadOpportunityVehicleCreateSchema.safeParse(
    parseLoadOpportunityVehicleCreateInput(formData),
  );

  if (!validation.success) {
    throw new Error("Invalid opportunity vehicle request.");
  }

  const vehicle = await createLoadOpportunityVehicle(validation.data);

  await recordEntityChange({
    entityType: "load_opportunity",
    entityId: vehicle.opportunityId,
    actionType: "vehicle_added",
    noteBody: `${vehicle.year ?? "Year TBD"} ${vehicle.make} ${vehicle.model}`.trim(),
    newValue: {
      opportunityVehicleId: vehicle.id,
      vin: vehicle.vin,
      lotNumber: vehicle.lotNumber,
    },
  });

  return vehicle;
}

export async function updateLoadOpportunityVehicleFromFormData(formData: FormData) {
  const validation = loadOpportunityVehicleUpdateSchema.safeParse(
    parseLoadOpportunityVehicleUpdateInput(formData),
  );

  if (!validation.success) {
    throw new Error("Invalid opportunity vehicle update request.");
  }

  const vehicle = await updateLoadOpportunityVehicle(validation.data);

  await recordEntityChange({
    entityType: "load_opportunity",
    entityId: vehicle.opportunityId,
    actionType: "vehicle_updated",
    noteBody: `${vehicle.year ?? "Year TBD"} ${vehicle.make} ${vehicle.model}`.trim(),
    newValue: {
      opportunityVehicleId: vehicle.id,
      vin: vehicle.vin,
      lotNumber: vehicle.lotNumber,
    },
  });

  return vehicle;
}

export async function deleteLoadOpportunityVehicleFromFormData(formData: FormData) {
  const validation = loadOpportunityVehicleDeleteSchema.safeParse({
    opportunityVehicleId: normalizeText(formData.get("opportunityVehicleId")),
  });

  if (!validation.success) {
    throw new Error("Invalid opportunity vehicle delete request.");
  }

  await deleteLoadOpportunityVehicle(validation.data.opportunityVehicleId);
}

export async function createProblemFlagFromFormData(formData: FormData) {
  const validation = problemFlagCreateSchema.safeParse({
    entityType: normalizeText(formData.get("entityType")),
    entityId: normalizeText(formData.get("entityId")),
    flagType: normalizeText(formData.get("flagType")),
    priority: normalizeText(formData.get("priority")),
    noteBody: normalizeText(formData.get("noteBody")),
  });

  if (!validation.success) {
    throw new Error("Invalid problem flag request.");
  }

  const actor = await getActorContext();
  const flag = await createProblemFlag(validation.data);

  await recordActivity({
    entityType: validation.data.entityType,
    entityId: validation.data.entityId,
    actionType: "problem_flag_created",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: validation.data.noteBody,
    oldValue: null,
    newValue: {
      flagType: validation.data.flagType,
      priority: validation.data.priority,
    },
  });

  return flag;
}

export async function resolveProblemFlagFromFormData(formData: FormData) {
  const validation = problemFlagResolveSchema.safeParse({
    problemFlagId: normalizeText(formData.get("problemFlagId")),
  });

  if (!validation.success) {
    throw new Error("Invalid problem flag resolve request.");
  }

  const actor = await getActorContext();
  const flag = await resolveProblemFlag({
    problemFlagId: validation.data.problemFlagId,
    resolvedByEmail: actor.actorEmail,
  });

  await recordActivity({
    entityType: flag.entityType,
    entityId: flag.entityId,
    actionType: "problem_flag_resolved",
    actorEmail: actor.actorEmail,
    actorRole: actor.actorRole,
    noteBody: flag.noteBody,
    oldValue: {
      resolvedAt: null,
    },
    newValue: {
      resolvedAt: flag.resolvedAt,
      resolvedByEmail: flag.resolvedByEmail,
    },
  });

  return flag;
}
