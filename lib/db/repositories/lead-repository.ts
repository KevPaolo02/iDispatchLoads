import { getDatabase } from "@/lib/db/client";
import type { Lead, LeadCreateInput, LeadRow } from "@/lib/types";
import { createStableId } from "@/lib/utils";

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createLead(input: LeadCreateInput): Promise<Lead> {
  const db = getDatabase();
  const timestamp = new Date().toISOString();
  const leadInput = {
    id: createStableId(),
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
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const { data, error } = await db
    .from("leads")
    .insert({
      id: leadInput.id,
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
      created_at: leadInput.createdAt,
      updated_at: leadInput.updatedAt,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create lead.");
  }

  return mapLeadRow(data as LeadRow);
}

export async function listLeads(): Promise<Lead[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to list leads.");
  }

  return data.map((row) => mapLeadRow(row as LeadRow));
}
