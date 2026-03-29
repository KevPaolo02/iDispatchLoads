import { getDatabase } from "@/lib/db/client";
import type {
  DispatchLoadStatus,
  Load,
  LoadCreateInput,
  LoadNotesUpdateInput,
  LoadRow,
} from "@/lib/types";

function mapLoadRow(row: LoadRow): Load {
  return {
    id: row.id,
    driverId: row.driver_id,
    sourceLeadId: row.source_lead_id,
    company: row.company,
    origin: row.origin,
    destination: row.destination,
    pickupDate: row.pickup_date,
    deliveryDate: row.delivery_date,
    broker: row.broker,
    rate: row.rate,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createLoad(input: LoadCreateInput): Promise<Load> {
  const db = getDatabase();

  const { data, error } = await db
    .from("loads")
    .insert({
      driver_id: input.driverId,
      ...(input.sourceLeadId ? { source_lead_id: input.sourceLeadId } : {}),
      company: input.company,
      origin: input.origin,
      destination: input.destination,
      pickup_date: input.pickupDate,
      delivery_date: input.deliveryDate,
      broker: input.broker,
      rate: input.rate,
      status: input.status,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    console.error("[load-repository] Supabase insert failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        company: input.company,
        origin: input.origin,
        destination: input.destination,
        status: input.status,
        driverId: input.driverId,
      },
    });

    throw new Error(`Unable to create load: ${error.message}`);
  }

  if (!data) {
    console.error("[load-repository] Supabase insert returned no row", {
      table: "loads",
      payload: {
        company: input.company,
        origin: input.origin,
        destination: input.destination,
      },
    });

    throw new Error("Unable to create load: insert returned no row.");
  }

  return mapLoadRow(data as LoadRow);
}

export async function listLoads(): Promise<Load[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("loads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[load-repository] Supabase list failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list loads: ${error.message}`);
  }

  if (!data) {
    console.error("[load-repository] Supabase list returned no rows", {
      table: "loads",
    });

    throw new Error("Unable to list loads: query returned no rows.");
  }

  return data.map((row) => mapLoadRow(row as LoadRow));
}

export async function updateLoadStatus(
  loadId: string,
  status: DispatchLoadStatus,
): Promise<Load> {
  const db = getDatabase();
  const { data, error } = await db
    .from("loads")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", loadId)
    .select()
    .single();

  if (error) {
    console.error("[load-repository] Supabase status update failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId,
        status,
      },
    });

    throw new Error(`Unable to update load status: ${error.message}`);
  }

  if (!data) {
    console.error("[load-repository] Supabase status update returned no row", {
      table: "loads",
      payload: {
        loadId,
        status,
      },
    });

    throw new Error("Unable to update load status: update returned no row.");
  }

  return mapLoadRow(data as LoadRow);
}

export async function assignLoadToDriver(
  loadId: string,
  driverId: string | null,
): Promise<Load> {
  const db = getDatabase();
  const { data, error } = await db
    .from("loads")
    .update({
      driver_id: driverId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", loadId)
    .select()
    .single();

  if (error) {
    console.error("[load-repository] Supabase assignment update failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId,
        driverId,
      },
    });

    throw new Error(`Unable to assign load: ${error.message}`);
  }

  if (!data) {
    console.error("[load-repository] Supabase assignment update returned no row", {
      table: "loads",
      payload: {
        loadId,
        driverId,
      },
    });

    throw new Error("Unable to assign load: update returned no row.");
  }

  return mapLoadRow(data as LoadRow);
}

export async function updateLoadNotes(
  input: LoadNotesUpdateInput,
): Promise<Load> {
  const db = getDatabase();
  const { data, error } = await db
    .from("loads")
    .update({
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.loadId)
    .select()
    .single();

  if (error) {
    console.error("[load-repository] Supabase notes update failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId: input.loadId,
      },
    });

    throw new Error(`Unable to update load notes: ${error.message}`);
  }

  if (!data) {
    console.error("[load-repository] Supabase notes update returned no row", {
      table: "loads",
      payload: {
        loadId: input.loadId,
      },
    });

    throw new Error("Unable to update load notes: update returned no row.");
  }

  return mapLoadRow(data as LoadRow);
}
