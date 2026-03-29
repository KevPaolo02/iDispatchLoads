import { getDatabase } from "@/lib/db/client";
import type {
  LoadOpportunityVehicle,
  LoadOpportunityVehicleCreateInput,
  LoadOpportunityVehicleRow,
  LoadOpportunityVehicleUpdateInput,
} from "@/lib/types";

function mapLoadOpportunityVehicleRow(
  row: LoadOpportunityVehicleRow,
): LoadOpportunityVehicle {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
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

export async function listLoadOpportunityVehicles(): Promise<LoadOpportunityVehicle[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunity_vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[load-opportunity-vehicle-repository] Supabase list failed", {
      table: "load_opportunity_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list opportunity vehicles: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to list opportunity vehicles: query returned no rows.");
  }

  return data.map((row) =>
    mapLoadOpportunityVehicleRow(row as LoadOpportunityVehicleRow),
  );
}

export async function listLoadOpportunityVehiclesByOpportunityId(
  opportunityId: string,
): Promise<LoadOpportunityVehicle[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunity_vehicles")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "[load-opportunity-vehicle-repository] Supabase list by opportunity failed",
      {
        table: "load_opportunity_vehicles",
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: {
          opportunityId,
        },
      },
    );

    throw new Error(`Unable to list opportunity vehicles: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) =>
    mapLoadOpportunityVehicleRow(row as LoadOpportunityVehicleRow),
  );
}

export async function createLoadOpportunityVehicle(
  input: LoadOpportunityVehicleCreateInput,
): Promise<LoadOpportunityVehicle> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunity_vehicles")
    .insert({
      opportunity_id: input.opportunityId,
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
    console.error("[load-opportunity-vehicle-repository] Supabase insert failed", {
      table: "load_opportunity_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        opportunityId: input.opportunityId,
      },
    });

    throw new Error(`Unable to create opportunity vehicle: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to create opportunity vehicle: insert returned no row.");
  }

  return mapLoadOpportunityVehicleRow(data as LoadOpportunityVehicleRow);
}

export async function updateLoadOpportunityVehicle(
  input: LoadOpportunityVehicleUpdateInput,
): Promise<LoadOpportunityVehicle> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunity_vehicles")
    .update({
      year: input.year,
      make: input.make,
      model: input.model,
      vin: input.vin,
      lot_number: input.lotNumber,
      operability: input.operability,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.opportunityVehicleId)
    .select()
    .single();

  if (error) {
    console.error("[load-opportunity-vehicle-repository] Supabase update failed", {
      table: "load_opportunity_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        opportunityVehicleId: input.opportunityVehicleId,
      },
    });

    throw new Error(`Unable to update opportunity vehicle: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to update opportunity vehicle: update returned no row.");
  }

  return mapLoadOpportunityVehicleRow(data as LoadOpportunityVehicleRow);
}

export async function deleteLoadOpportunityVehicle(opportunityVehicleId: string) {
  const db = getDatabase();
  const { error } = await db
    .from("load_opportunity_vehicles")
    .delete()
    .eq("id", opportunityVehicleId);

  if (error) {
    console.error("[load-opportunity-vehicle-repository] Supabase delete failed", {
      table: "load_opportunity_vehicles",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        opportunityVehicleId,
      },
    });

    throw new Error(`Unable to delete opportunity vehicle: ${error.message}`);
  }
}
