import { cache } from "react";

import { getRankedDriverMatches, type DriverMatch } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];
type LoadRow = Database["public"]["Tables"]["loads"]["Row"];
type OfferRow = Database["public"]["Tables"]["offers"]["Row"];

export type OfferWithDriver = OfferRow & {
  driver: DriverRow | null;
};

export type LoadWithRelations = LoadRow & {
  driver: DriverRow | null;
  offers: OfferWithDriver[];
  matches: DriverMatch[];
};

export type DriverOfferView = OfferWithDriver & {
  load: LoadRow | null;
};

function requireData<T>(data: T | null, error: Error | null, label: string) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }

  return data;
}

const offerDriverSelect =
  "id, name, phone, current_location, preferred_routes, trailer_type, is_available, created_at";

export const getDashboardData = cache(async () => {
  const supabase = await createClient();

  const [loadsResult, driversResult, offersResult] = await Promise.all([
    supabase.from("loads").select("*").order("pickup_date", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("drivers").select("*").order("is_available", { ascending: false }).order("name", { ascending: true }),
    supabase
      .from("offers")
      .select(`id, load_id, driver_id, status, offered_price, message_body, responded_at, created_at, driver:drivers!offers_driver_id_fkey(${offerDriverSelect})`)
      .order("created_at", { ascending: false }),
  ]);

  const loads = requireData(loadsResult.data, loadsResult.error, "Unable to load dispatch board") ?? [];
  const drivers = requireData(driversResult.data, driversResult.error, "Unable to load drivers") ?? [];
  const offers = (requireData(offersResult.data, offersResult.error, "Unable to load offers") ?? []) as Array<
    OfferRow & {
      driver: DriverRow | null;
    }
  >;

  const driversById = new Map<string, DriverRow>(drivers.map((driver) => [driver.id, driver]));
  const offersByLoadId = new Map<string, OfferWithDriver[]>();

  for (const offer of offers) {
    const current = offersByLoadId.get(offer.load_id) ?? [];
    current.push(offer);
    offersByLoadId.set(offer.load_id, current);
  }

  const hydratedLoads: LoadWithRelations[] = (loads as LoadRow[]).map((load) => ({
    ...load,
    driver: load.driver_id ? driversById.get(load.driver_id) ?? null : null,
    offers: offersByLoadId.get(load.id) ?? [],
    matches: getRankedDriverMatches(load, drivers as DriverRow[]),
  }));

  return {
    loads: hydratedLoads,
    drivers: drivers as DriverRow[],
  };
});

export async function getLoadDetail(loadId: string) {
  const supabase = await createClient();

  const [loadResult, driversResult, offersResult] = await Promise.all([
    supabase.from("loads").select("*").eq("id", loadId).single(),
    supabase.from("drivers").select("*").order("is_available", { ascending: false }).order("name", { ascending: true }),
    supabase
      .from("offers")
      .select(`id, load_id, driver_id, status, offered_price, message_body, responded_at, created_at, driver:drivers!offers_driver_id_fkey(${offerDriverSelect})`)
      .eq("load_id", loadId)
      .order("created_at", { ascending: false }),
  ]);

  const load = requireData(loadResult.data, loadResult.error, "Unable to load load record") as LoadRow;
  const drivers = (requireData(driversResult.data, driversResult.error, "Unable to load drivers") ?? []) as DriverRow[];
  const offers = (requireData(offersResult.data, offersResult.error, "Unable to load offers") ?? []) as Array<
    OfferRow & {
      driver: DriverRow | null;
    }
  >;

  const driver = load.driver_id ? drivers.find((candidate) => candidate.id === load.driver_id) ?? null : null;

  return {
    load: {
      ...load,
      driver,
      offers,
      matches: getRankedDriverMatches(load, drivers),
    } satisfies LoadWithRelations,
    drivers,
  };
}

export async function getDriversData() {
  const supabase = await createClient();

  const [driversResult, loadsResult] = await Promise.all([
    supabase.from("drivers").select("*").order("is_available", { ascending: false }).order("name", { ascending: true }),
    supabase.from("loads").select("id, driver_id, status").in("status", ["ASSIGNED", "COMPLETED"]),
  ]);

  const drivers = (requireData(driversResult.data, driversResult.error, "Unable to load drivers") ?? []) as DriverRow[];
  const assignedLoads = (requireData(loadsResult.data, loadsResult.error, "Unable to load driver load counts") ?? []) as Array<
    Pick<LoadRow, "id" | "driver_id" | "status">
  >;

  const assignedCountByDriver = new Map<string, number>();

  for (const load of assignedLoads) {
    if (!load.driver_id) {
      continue;
    }

    assignedCountByDriver.set(load.driver_id, (assignedCountByDriver.get(load.driver_id) ?? 0) + 1);
  }

  return {
    drivers,
    assignedCountByDriver,
  };
}

export async function getDriverPanelData(selectedDriverId: string | null) {
  const supabase = await createClient();

  const driversResult = await supabase
    .from("drivers")
    .select("*")
    .order("is_available", { ascending: false })
    .order("name", { ascending: true });

  const drivers = (requireData(driversResult.data, driversResult.error, "Unable to load drivers") ?? []) as DriverRow[];
  const selectedDriver = selectedDriverId
    ? drivers.find((driver) => driver.id === selectedDriverId) ?? null
    : drivers.length === 1
      ? drivers[0]
      : null;

  if (!selectedDriver) {
    return {
      drivers,
      selectedDriver: null,
      offers: [] as DriverOfferView[],
      assignedLoads: [] as LoadRow[],
    };
  }

  const [offersResult, assignedLoadsResult] = await Promise.all([
    supabase
      .from("offers")
      .select(`id, load_id, driver_id, status, offered_price, message_body, responded_at, created_at, driver:drivers!offers_driver_id_fkey(${offerDriverSelect})`)
      .eq("driver_id", selectedDriver.id)
      .order("created_at", { ascending: false }),
    supabase.from("loads").select("*").eq("driver_id", selectedDriver.id).order("pickup_date", { ascending: true }),
  ]);

  const offers = (requireData(offersResult.data, offersResult.error, "Unable to load driver offers") ?? []) as Array<
    OfferRow & {
      driver: DriverRow | null;
    }
  >;
  const assignedLoads = (requireData(
    assignedLoadsResult.data,
    assignedLoadsResult.error,
    "Unable to load assigned loads",
  ) ?? []) as LoadRow[];

  const loadIds = [...new Set(offers.map((offer) => offer.load_id))];
  const loadsById = new Map<string, LoadRow>();

  if (loadIds.length > 0) {
    const loadsResult = await supabase.from("loads").select("*").in("id", loadIds);
    const loads = (requireData(loadsResult.data, loadsResult.error, "Unable to load offer routes") ?? []) as LoadRow[];
    for (const load of loads) {
      loadsById.set(load.id, load);
    }
  }

  const offerViews: DriverOfferView[] = offers.map((offer) => ({
    ...offer,
    load: loadsById.get(offer.load_id) ?? null,
  }));

  return {
    drivers,
    selectedDriver,
    offers: offerViews,
    assignedLoads,
  };
}
