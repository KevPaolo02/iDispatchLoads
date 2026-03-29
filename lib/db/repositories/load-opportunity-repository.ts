import { getDatabase } from "@/lib/db/client";
import type {
  LoadOpportunity,
  LoadOpportunityAssignmentInput,
  LoadOpportunityCreateInput,
  LoadOpportunityNotesUpdateInput,
  LoadOpportunityOperationalUpdateInput,
  LoadOpportunityRow,
  LoadOpportunityStatus,
} from "@/lib/types";

function mapLoadOpportunityRow(row: LoadOpportunityRow): LoadOpportunity {
  return {
    id: row.id,
    source: row.source,
    sourceUrl: row.source_url,
    sourceReference: row.source_reference,
    company: row.company,
    origin: row.origin,
    destination: row.destination,
    pickupCity: row.pickup_city,
    pickupState: row.pickup_state,
    pickupZip: row.pickup_zip,
    deliveryCity: row.delivery_city,
    deliveryState: row.delivery_state,
    deliveryZip: row.delivery_zip,
    trailerType: row.trailer_type,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    firstAvailableDate: row.first_available_date,
    pickupWindow: row.pickup_window,
    deliveryWindow: row.delivery_window,
    vehiclesCount: row.vehicles_count,
    customerPrice: row.customer_price,
    carrierPay: row.carrier_pay,
    rate: row.rate,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    status: row.status,
    assignedDriverId: row.assigned_driver_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createLoadOpportunity(
  input: LoadOpportunityCreateInput,
): Promise<LoadOpportunity> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .insert({
      source: input.source,
      source_url: input.sourceUrl,
      source_reference: input.sourceReference,
      company: input.company,
      origin: input.origin,
      destination: input.destination,
      pickup_city: input.pickupCity,
      pickup_state: input.pickupState,
      pickup_zip: input.pickupZip,
      delivery_city: input.deliveryCity,
      delivery_state: input.deliveryState,
      delivery_zip: input.deliveryZip,
      trailer_type: input.trailerType,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      first_available_date: input.firstAvailableDate,
      pickup_window: input.pickupWindow,
      delivery_window: input.deliveryWindow,
      vehicles_count: input.vehiclesCount,
      customer_price: input.customerPrice,
      carrier_pay: input.carrierPay,
      rate: input.rate,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      status: input.status,
      assigned_driver_id: input.assignedDriverId,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    console.error("[load-opportunity-repository] Supabase insert failed", {
      table: "load_opportunities",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        source: input.source,
        origin: input.origin,
        destination: input.destination,
        status: input.status,
      },
    });

    throw new Error(`Unable to create opportunity: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to create opportunity: insert returned no row.");
  }

  return mapLoadOpportunityRow(data as LoadOpportunityRow);
}

export async function listLoadOpportunities(): Promise<LoadOpportunity[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[load-opportunity-repository] Supabase list failed", {
      table: "load_opportunities",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list opportunities: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to list opportunities: query returned no rows.");
  }

  return data.map((row) => mapLoadOpportunityRow(row as LoadOpportunityRow));
}

export async function getLoadOpportunityById(
  opportunityId: string,
): Promise<LoadOpportunity | null> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .select("*")
    .eq("id", opportunityId)
    .maybeSingle();

  if (error) {
    console.error("[load-opportunity-repository] Supabase get by id failed", {
      table: "load_opportunities",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        opportunityId,
      },
    });

    throw new Error(`Unable to load opportunity: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapLoadOpportunityRow(data as LoadOpportunityRow);
}

export async function updateLoadOpportunityStatus(
  opportunityId: string,
  status: LoadOpportunityStatus,
): Promise<LoadOpportunity> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", opportunityId)
    .select()
    .single();

  if (error) {
    console.error("[load-opportunity-repository] Supabase status update failed", {
      table: "load_opportunities",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        opportunityId,
        status,
      },
    });

    throw new Error(`Unable to update opportunity status: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      "Unable to update opportunity status: update returned no row.",
    );
  }

  return mapLoadOpportunityRow(data as LoadOpportunityRow);
}

export async function updateLoadOpportunityNotes(
  input: LoadOpportunityNotesUpdateInput,
): Promise<LoadOpportunity> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .update({
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.opportunityId)
    .select()
    .single();

  if (error) {
    console.error("[load-opportunity-repository] Supabase notes update failed", {
      table: "load_opportunities",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        opportunityId: input.opportunityId,
      },
    });

    throw new Error(`Unable to update opportunity notes: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      "Unable to update opportunity notes: update returned no row.",
    );
  }

  return mapLoadOpportunityRow(data as LoadOpportunityRow);
}

export async function updateLoadOpportunityOperationalDetails(
  input: LoadOpportunityOperationalUpdateInput,
): Promise<LoadOpportunity> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .update({
      source_reference: input.sourceReference,
      pickup_city: input.pickupCity,
      pickup_state: input.pickupState,
      pickup_zip: input.pickupZip,
      delivery_city: input.deliveryCity,
      delivery_state: input.deliveryState,
      delivery_zip: input.deliveryZip,
      trailer_type: input.trailerType,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      first_available_date: input.firstAvailableDate,
      pickup_window: input.pickupWindow,
      delivery_window: input.deliveryWindow,
      customer_price: input.customerPrice,
      carrier_pay: input.carrierPay,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.opportunityId)
    .select()
    .single();

  if (error) {
    console.error(
      "[load-opportunity-repository] Supabase operational update failed",
      {
        table: "load_opportunities",
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: {
          opportunityId: input.opportunityId,
        },
      },
    );

    throw new Error(`Unable to update opportunity details: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to update opportunity details: update returned no row.");
  }

  return mapLoadOpportunityRow(data as LoadOpportunityRow);
}

export async function assignLoadOpportunityToDriver(
  input: LoadOpportunityAssignmentInput,
): Promise<LoadOpportunity> {
  const db = getDatabase();
  const { data, error } = await db
    .from("load_opportunities")
    .update({
      assigned_driver_id: input.driverId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.opportunityId)
    .select()
    .single();

  if (error) {
    console.error(
      "[load-opportunity-repository] Supabase assignment update failed",
      {
        table: "load_opportunities",
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: {
          opportunityId: input.opportunityId,
          driverId: input.driverId,
        },
      },
    );

    throw new Error(`Unable to assign opportunity: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to assign opportunity: update returned no row.");
  }

  return mapLoadOpportunityRow(data as LoadOpportunityRow);
}
