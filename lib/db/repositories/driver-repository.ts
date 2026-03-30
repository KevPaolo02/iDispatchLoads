import { getDatabase } from "@/lib/db/client";
import type {
  Driver,
  DriverCreateInput,
  DriverMovementUpdateInput,
  DriverNotesUpdateInput,
  DriverProfileUpdateInput,
  DriverRow,
  DriverStatus,
} from "@/lib/types";

function mapDriverRow(row: DriverRow): Driver {
  return {
    id: row.id,
    sourceLeadId: row.source_lead_id,
    assignedDispatcherEmail: row.assigned_dispatcher_email,
    company: row.company,
    driverName: row.driver_name,
    phone: row.phone,
    truckType: row.truck_type,
    truckUnitNumber: row.truck_unit_number,
    truckVin: row.truck_vin,
    trailerUnitNumber: row.trailer_unit_number,
    trailerVin: row.trailer_vin,
    preferredLanes: row.preferred_lanes,
    homeBase: row.home_base,
    currentLocation: row.current_location,
    availableFrom: row.available_from,
    capacity: row.capacity,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createDriver(input: DriverCreateInput): Promise<Driver> {
  const db = getDatabase();

  const { data, error } = await db
    .from("drivers")
    .insert({
      ...(input.sourceLeadId ? { source_lead_id: input.sourceLeadId } : {}),
      assigned_dispatcher_email: input.assignedDispatcherEmail,
      company: input.company,
      driver_name: input.driverName,
      phone: input.phone,
      truck_type: input.truckType,
      truck_unit_number: input.truckUnitNumber,
      truck_vin: input.truckVin,
      trailer_unit_number: input.trailerUnitNumber,
      trailer_vin: input.trailerVin,
      ...(input.preferredLanes ? { preferred_lanes: input.preferredLanes } : {}),
      home_base: input.homeBase,
      current_location: input.currentLocation,
      available_from: input.availableFrom,
      capacity: input.capacity,
      status: input.status,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    console.error("[driver-repository] Supabase insert failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        company: input.company,
        driverName: input.driverName,
        truckType: input.truckType,
        status: input.status,
      },
    });

    throw new Error(`Unable to create driver: ${error.message}`);
  }

  if (!data) {
    console.error("[driver-repository] Supabase insert returned no row", {
      table: "drivers",
      payload: {
        company: input.company,
        driverName: input.driverName,
      },
    });

    throw new Error("Unable to create driver: insert returned no row.");
  }

  return mapDriverRow(data as DriverRow);
}

export async function listDrivers(): Promise<Driver[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[driver-repository] Supabase list failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list drivers: ${error.message}`);
  }

  if (!data) {
    console.error("[driver-repository] Supabase list returned no rows", {
      table: "drivers",
    });

    throw new Error("Unable to list drivers: query returned no rows.");
  }

  return data.map((row) => mapDriverRow(row as DriverRow));
}

export async function getDriverBySourceLeadId(
  sourceLeadId: string,
): Promise<Driver | null> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .select("*")
    .eq("source_lead_id", sourceLeadId)
    .maybeSingle();

  if (error) {
    console.error("[driver-repository] Supabase get by source lead failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        sourceLeadId,
      },
    });

    throw new Error(`Unable to load driver by lead: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapDriverRow(data as DriverRow);
}

export async function getDriverById(driverId: string): Promise<Driver | null> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .select("*")
    .eq("id", driverId)
    .maybeSingle();

  if (error) {
    console.error("[driver-repository] Supabase get by id failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        driverId,
      },
    });

    throw new Error(`Unable to load driver: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapDriverRow(data as DriverRow);
}

export async function updateDriverStatus(
  driverId: string,
  status: DriverStatus,
): Promise<Driver> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", driverId)
    .select()
    .single();

  if (error) {
    console.error("[driver-repository] Supabase status update failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        driverId,
        status,
      },
    });

    throw new Error(`Unable to update driver status: ${error.message}`);
  }

  if (!data) {
    console.error("[driver-repository] Supabase status update returned no row", {
      table: "drivers",
      payload: {
        driverId,
        status,
      },
    });

    throw new Error("Unable to update driver status: update returned no row.");
  }

  return mapDriverRow(data as DriverRow);
}

export async function updateDriverNotes(
  input: DriverNotesUpdateInput,
): Promise<Driver> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .update({
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.driverId)
    .select()
    .single();

  if (error) {
    console.error("[driver-repository] Supabase notes update failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        driverId: input.driverId,
      },
    });

    throw new Error(`Unable to update driver notes: ${error.message}`);
  }

  if (!data) {
    console.error("[driver-repository] Supabase notes update returned no row", {
      table: "drivers",
      payload: {
        driverId: input.driverId,
      },
    });

    throw new Error("Unable to update driver notes: update returned no row.");
  }

  return mapDriverRow(data as DriverRow);
}

export async function updateDriverMovement(
  input: DriverMovementUpdateInput,
): Promise<Driver> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .update({
      assigned_dispatcher_email: input.assignedDispatcherEmail,
      truck_unit_number: input.truckUnitNumber,
      truck_vin: input.truckVin,
      trailer_unit_number: input.trailerUnitNumber,
      trailer_vin: input.trailerVin,
      current_location: input.currentLocation,
      available_from: input.availableFrom,
      capacity: input.capacity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.driverId)
    .select()
    .single();

  if (error) {
    console.error("[driver-repository] Supabase movement update failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        driverId: input.driverId,
      },
    });

    throw new Error(`Unable to update driver movement: ${error.message}`);
  }

  if (!data) {
    console.error(
      "[driver-repository] Supabase movement update returned no row",
      {
        table: "drivers",
        payload: {
          driverId: input.driverId,
        },
      },
    );

    throw new Error("Unable to update driver movement: update returned no row.");
  }

  return mapDriverRow(data as DriverRow);
}

export async function updateDriverProfile(
  input: DriverProfileUpdateInput,
): Promise<Driver> {
  const db = getDatabase();
  const { data, error } = await db
    .from("drivers")
    .update({
      assigned_dispatcher_email: input.assignedDispatcherEmail,
      company: input.company,
      driver_name: input.driverName,
      phone: input.phone,
      truck_type: input.truckType,
      truck_unit_number: input.truckUnitNumber,
      truck_vin: input.truckVin,
      trailer_unit_number: input.trailerUnitNumber,
      trailer_vin: input.trailerVin,
      preferred_lanes: input.preferredLanes,
      home_base: input.homeBase,
      current_location: input.currentLocation,
      available_from: input.availableFrom,
      capacity: input.capacity,
      status: input.status,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.driverId)
    .select()
    .single();

  if (error) {
    console.error("[driver-repository] Supabase profile update failed", {
      table: "drivers",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        driverId: input.driverId,
        company: input.company,
        driverName: input.driverName,
      },
    });

    throw new Error(`Unable to update driver profile: ${error.message}`);
  }

  if (!data) {
    console.error("[driver-repository] Supabase profile update returned no row", {
      table: "drivers",
      payload: {
        driverId: input.driverId,
      },
    });

    throw new Error("Unable to update driver profile: update returned no row.");
  }

  return mapDriverRow(data as DriverRow);
}
