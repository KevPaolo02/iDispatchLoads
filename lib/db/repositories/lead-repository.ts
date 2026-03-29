import { getDatabase } from "@/lib/db/client";
import type {
  Lead,
  LeadActivityUpdateInput,
  LeadCreateInput,
  LeadNotesUpdateInput,
  LeadRow,
} from "@/lib/types";

function mapLeadRow(row: LeadRow): Lead {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    truckType: row.truck_type,
    preferredLanes: row.preferred_lanes,
    notes: row.notes,
    status: row.status,
    source: row.source,
    campaign: row.campaign,
    lastContactedAt: row.last_contacted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createLead(input: LeadCreateInput): Promise<Lead> {
  const db = getDatabase();
  const leadInput = {
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    truckType: input.truckType,
    preferredLanes: input.preferredLanes,
    notes: input.notes,
    status: input.status,
    source: input.source,
    campaign: input.campaign,
  };

  const { data, error } = await db
    .from("leads")
    .insert({
      first_name: leadInput.firstName,
      last_name: leadInput.lastName,
      phone: leadInput.phone,
      email: leadInput.email,
      truck_type: leadInput.truckType,
      preferred_lanes: leadInput.preferredLanes,
      notes: leadInput.notes,
      status: leadInput.status,
      source: leadInput.source,
      campaign: leadInput.campaign,
    })
    .select()
    .single();

  if (error) {
    console.error("[lead-repository] Supabase insert failed", {
      table: "leads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        email: leadInput.email,
        phone: leadInput.phone,
        truckType: leadInput.truckType,
        preferredLanes: leadInput.preferredLanes,
        status: leadInput.status,
        source: leadInput.source,
        campaign: leadInput.campaign,
      },
    });

    throw new Error(`Unable to create lead: ${error.message}`);
  }

  if (!data) {
    console.error("[lead-repository] Supabase insert returned no row", {
      table: "leads",
      payload: {
        email: leadInput.email,
        phone: leadInput.phone,
        truckType: leadInput.truckType,
        preferredLanes: leadInput.preferredLanes,
        status: leadInput.status,
        source: leadInput.source,
        campaign: leadInput.campaign,
      },
    });

    throw new Error("Unable to create lead: insert returned no row.");
  }

  return mapLeadRow(data as LeadRow);
}

export async function listLeads(): Promise<Lead[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[lead-repository] Supabase list failed", {
      table: "leads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list leads: ${error.message}`);
  }

  if (!data) {
    console.error("[lead-repository] Supabase list returned no rows", {
      table: "leads",
    });

    throw new Error("Unable to list leads: query returned no rows.");
  }

  return data.map((row) => mapLeadRow(row as LeadRow));
}

export async function getLeadById(leadId: string): Promise<Lead | null> {
  const db = getDatabase();
  const { data, error } = await db
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    console.error("[lead-repository] Supabase get by id failed", {
      table: "leads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        leadId,
      },
    });

    throw new Error(`Unable to load lead: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapLeadRow(data as LeadRow);
}

export async function updateLeadActivity(
  input: LeadActivityUpdateInput,
): Promise<Lead> {
  const db = getDatabase();
  const { data, error } = await db
    .from("leads")
    .update({
      status: input.status,
      ...(Object.prototype.hasOwnProperty.call(input, "notes")
        ? { notes: input.notes ?? null }
        : {}),
      ...(input.lastContactedAt
        ? { last_contacted_at: input.lastContactedAt }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.leadId)
    .select()
    .single();

  if (error) {
    console.error("[lead-repository] Supabase activity update failed", {
      table: "leads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        leadId: input.leadId,
        status: input.status,
      },
    });

    throw new Error(`Unable to update lead: ${error.message}`);
  }

  if (!data) {
    console.error("[lead-repository] Supabase activity update returned no row", {
      table: "leads",
      payload: {
        leadId: input.leadId,
        status: input.status,
      },
    });

    throw new Error("Unable to update lead: update returned no row.");
  }

  return mapLeadRow(data as LeadRow);
}

export async function updateLeadNotes(
  input: LeadNotesUpdateInput,
): Promise<Lead> {
  const db = getDatabase();
  const { data, error } = await db
    .from("leads")
    .update({
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.leadId)
    .select()
    .single();

  if (error) {
    console.error("[lead-repository] Supabase notes update failed", {
      table: "leads",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        leadId: input.leadId,
      },
    });

    throw new Error(`Unable to update lead notes: ${error.message}`);
  }

  if (!data) {
    console.error("[lead-repository] Supabase notes update returned no row", {
      table: "leads",
      payload: {
        leadId: input.leadId,
      },
    });

    throw new Error("Unable to update lead notes: update returned no row.");
  }

  return mapLeadRow(data as LeadRow);
}
