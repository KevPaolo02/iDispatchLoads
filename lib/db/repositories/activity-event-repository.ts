import { getDatabase } from "@/lib/db/client";
import type {
  ActivityEvent,
  ActivityEventCreateInput,
  ActivityEventInsertRow,
  JsonValue,
  ActivityEventRow,
} from "@/lib/types";

function mapActivityEventRow(row: ActivityEventRow): ActivityEvent {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actionType: row.action_type,
    actorEmail: row.actor_email,
    actorRole: row.actor_role,
    noteBody: row.note_body,
    oldValue:
      row.old_value && typeof row.old_value === "object" && !Array.isArray(row.old_value)
        ? (row.old_value as Record<string, unknown>)
        : null,
    newValue:
      row.new_value && typeof row.new_value === "object" && !Array.isArray(row.new_value)
        ? (row.new_value as Record<string, unknown>)
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createActivityEvent(
  input: ActivityEventCreateInput,
): Promise<ActivityEvent> {
  const db = getDatabase();
  const insertRow: ActivityEventInsertRow = {
    entity_type: input.entityType,
    entity_id: input.entityId,
    action_type: input.actionType,
    actor_email: input.actorEmail,
    actor_role: input.actorRole,
    note_body: input.noteBody,
    old_value: (input.oldValue as JsonValue | null | undefined) ?? null,
    new_value: (input.newValue as JsonValue | null | undefined) ?? null,
  };
  const { data, error } = await db
    .from("activity_events")
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    console.error("[activity-event-repository] Supabase insert failed", {
      table: "activity_events",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        entityType: input.entityType,
        entityId: input.entityId,
        actionType: input.actionType,
      },
    });

    throw new Error(`Unable to create activity event: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to create activity event: insert returned no row.");
  }

  return mapActivityEventRow(data as ActivityEventRow);
}

export async function listActivityEventsByEntity(
  entityType: ActivityEvent["entityType"],
  entityId: string,
): Promise<ActivityEvent[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("activity_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[activity-event-repository] Supabase list failed", {
      table: "activity_events",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        entityType,
        entityId,
      },
    });

    throw new Error(`Unable to list activity events: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => mapActivityEventRow(row as ActivityEventRow));
}
