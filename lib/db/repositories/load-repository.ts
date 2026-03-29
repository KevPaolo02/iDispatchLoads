import { getDatabase } from "@/lib/db/client";
import type {
  DispatchLoadStatus,
  Load,
  LoadCreateInput,
  LoadNotesUpdateInput,
  LoadOperationalUpdateInput,
  LoadRow,
} from "@/lib/types";

function mapLoadRow(row: LoadRow): Load {
  return {
    id: row.id,
    driverId: row.driver_id,
    sourceLeadId: row.source_lead_id,
    sourceOpportunityId: row.source_opportunity_id,
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
    pickupDate: row.pickup_date,
    deliveryDate: row.delivery_date,
    broker: row.broker,
    customerPrice: row.customer_price,
    carrierPay: row.carrier_pay,
    depositCollected: row.deposit_collected,
    codAmount: row.cod_amount,
    referenceNumber: row.reference_number,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    pickupContactName: row.pickup_contact_name,
    pickupContactPhone: row.pickup_contact_phone,
    deliveryContactName: row.delivery_contact_name,
    deliveryContactPhone: row.delivery_contact_phone,
    carrierCompany: row.carrier_company,
    carrierMcNumber: row.carrier_mc_number,
    carrierDispatcherName: row.carrier_dispatcher_name,
    carrierDispatcherPhone: row.carrier_dispatcher_phone,
    carrierDriverName: row.carrier_driver_name,
    carrierDriverPhone: row.carrier_driver_phone,
    truckTrailerType: row.truck_trailer_type,
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
      ...(input.sourceOpportunityId
        ? { source_opportunity_id: input.sourceOpportunityId }
        : {}),
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
      pickup_date: input.pickupDate,
      delivery_date: input.deliveryDate,
      broker: input.broker,
      customer_price: input.customerPrice,
      carrier_pay: input.carrierPay,
      deposit_collected: input.depositCollected,
      cod_amount: input.codAmount,
      reference_number: input.referenceNumber,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      pickup_contact_name: input.pickupContactName,
      pickup_contact_phone: input.pickupContactPhone,
      delivery_contact_name: input.deliveryContactName,
      delivery_contact_phone: input.deliveryContactPhone,
      carrier_company: input.carrierCompany,
      carrier_mc_number: input.carrierMcNumber,
      carrier_dispatcher_name: input.carrierDispatcherName,
      carrier_dispatcher_phone: input.carrierDispatcherPhone,
      carrier_driver_name: input.carrierDriverName,
      carrier_driver_phone: input.carrierDriverPhone,
      truck_trailer_type: input.truckTrailerType,
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
        sourceOpportunityId: input.sourceOpportunityId,
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

export async function getLoadById(loadId: string): Promise<Load | null> {
  const db = getDatabase();
  const { data, error } = await db
    .from("loads")
    .select("*")
    .eq("id", loadId)
    .maybeSingle();

  if (error) {
    console.error("[load-repository] Supabase get by id failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId,
      },
    });

    throw new Error(`Unable to load load: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapLoadRow(data as LoadRow);
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

export async function updateLoadOperationalDetails(
  input: LoadOperationalUpdateInput,
): Promise<Load> {
  const db = getDatabase();
  const { data, error } = await db
    .from("loads")
    .update({
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
      pickup_date: input.pickupDate,
      delivery_date: input.deliveryDate,
      customer_price: input.customerPrice,
      carrier_pay: input.carrierPay,
      deposit_collected: input.depositCollected,
      cod_amount: input.codAmount,
      reference_number: input.referenceNumber,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      pickup_contact_name: input.pickupContactName,
      pickup_contact_phone: input.pickupContactPhone,
      delivery_contact_name: input.deliveryContactName,
      delivery_contact_phone: input.deliveryContactPhone,
      carrier_company: input.carrierCompany,
      carrier_mc_number: input.carrierMcNumber,
      carrier_dispatcher_name: input.carrierDispatcherName,
      carrier_dispatcher_phone: input.carrierDispatcherPhone,
      carrier_driver_name: input.carrierDriverName,
      carrier_driver_phone: input.carrierDriverPhone,
      truck_trailer_type: input.truckTrailerType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.loadId)
    .select()
    .single();

  if (error) {
    console.error("[load-repository] Supabase operational update failed", {
      table: "loads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        loadId: input.loadId,
      },
    });

    throw new Error(`Unable to update load details: ${error.message}`);
  }

  if (!data) {
    console.error("[load-repository] Supabase operational update returned no row", {
      table: "loads",
      payload: {
        loadId: input.loadId,
      },
    });

    throw new Error("Unable to update load details: update returned no row.");
  }

  return mapLoadRow(data as LoadRow);
}
