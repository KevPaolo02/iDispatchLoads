import { getDatabase } from "@/lib/db/client";
import type {
  LoadVehicle,
  LoadVehicleCreateInput,
  LoadVehicleRow,
  LoadVehicleUpdateInput,
} from "@/lib/types";

function mapLoadVehicleRow(row: LoadVehicleRow): LoadVehicle {
  return {
    id: row.id,
    loadId: row.load_id,
    year: row.year,
    make: row.make,
    model: row.model,
    vin: row.vin,
    lotNumber: row.lot_number,
    operability: row.operability,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listLoadVehicles(): Promise<LoadVehicle[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[load-vehicle-repository] Supabase list failed", {
      table: "load_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list load vehicles: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to list load vehicles: query returned no rows.");
  }

  return data.map((row) => mapLoadVehicleRow(row as LoadVehicleRow));
}

export async function listLoadVehiclesByLoadId(
  loadId: string,
): Promise<LoadVehicle[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_vehicles")
    .select("*")
    .eq("load_id", loadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[load-vehicle-repository] Supabase list by load failed", {
      table: "load_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId,
      },
    });

    throw new Error(`Unable to list load vehicles: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => mapLoadVehicleRow(row as LoadVehicleRow));
}

export async function createLoadVehicle(
  input: LoadVehicleCreateInput,
): Promise<LoadVehicle> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_vehicles")
    .insert({
      load_id: input.loadId,
      year: input.year,
      make: input.make,
      model: input.model,
      vin: input.vin,
      lot_number: input.lotNumber,
      operability: input.operability,
    })
    .select()
    .single();

  if (error) {
    console.error("[load-vehicle-repository] Supabase insert failed", {
      table: "load_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId: input.loadId,
        make: input.make,
        model: input.model,
      },
    });

    throw new Error(`Unable to create load vehicle: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to create load vehicle: insert returned no row.");
  }

  return mapLoadVehicleRow(data as LoadVehicleRow);
}

export async function updateLoadVehicle(
  input: LoadVehicleUpdateInput,
): Promise<LoadVehicle> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_vehicles")
    .update({
      year: input.year,
      make: input.make,
      model: input.model,
      vin: input.vin,
      lot_number: input.lotNumber,
      operability: input.operability,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.loadVehicleId)
    .select()
    .single();

  if (error) {
    console.error("[load-vehicle-repository] Supabase update failed", {
      table: "load_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadVehicleId: input.loadVehicleId,
      },
    });

    throw new Error(`Unable to update load vehicle: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to update load vehicle: update returned no row.");
  }

  return mapLoadVehicleRow(data as LoadVehicleRow);
}

export async function deleteLoadVehicle(loadVehicleId: string) {
  const db = getDatabase();
  const { error } = await db.from("load_vehicles").delete().eq("id", loadVehicleId);

  if (error) {
    console.error("[load-vehicle-repository] Supabase delete failed", {
      table: "load_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadVehicleId,
      },
    });

    throw new Error(`Unable to delete load vehicle: ${error.message}`);
  }
}
