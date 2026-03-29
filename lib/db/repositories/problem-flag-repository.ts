import { getDatabase } from "@/lib/db/client";
import type {
  ProblemFlag,
  ProblemFlagCreateInput,
  ProblemFlagInsertRow,
  ProblemFlagResolveInput,
  ProblemFlagRow,
} from "@/lib/types";

function mapProblemFlagRow(row: ProblemFlagRow): ProblemFlag {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    flagType: row.flag_type,
    priority: row.priority,
    noteBody: row.note_body,
    resolvedAt: row.resolved_at,
    resolvedByEmail: row.resolved_by_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProblemFlag(
  input: ProblemFlagCreateInput,
): Promise<ProblemFlag> {
  const db = getDatabase();
  const insertRow: ProblemFlagInsertRow = {
    entity_type: input.entityType,
    entity_id: input.entityId,
    flag_type: input.flagType,
    priority: input.priority,
    note_body: input.noteBody,
  };
  const { data, error } = await db
    .from("problem_flags")
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    console.error("[problem-flag-repository] Supabase insert failed", {
      table: "problem_flags",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });

    throw new Error(`Unable to create problem flag: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to create problem flag: insert returned no row.");
  }

  return mapProblemFlagRow(data as ProblemFlagRow);
}

export async function resolveProblemFlag(
  input: ProblemFlagResolveInput,
): Promise<ProblemFlag> {
  const db = getDatabase();
  const { data, error } = await db
    .from("problem_flags")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by_email: input.resolvedByEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.problemFlagId)
    .select()
    .single();

  if (error) {
    console.error("[problem-flag-repository] Supabase resolve failed", {
      table: "problem_flags",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        problemFlagId: input.problemFlagId,
      },
    });

    throw new Error(`Unable to resolve problem flag: ${error.message}`);
  }

  if (!data) {
    throw new Error("Unable to resolve problem flag: update returned no row.");
  }

  return mapProblemFlagRow(data as ProblemFlagRow);
}

export async function listProblemFlags(): Promise<ProblemFlag[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("problem_flags")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[problem-flag-repository] Supabase list failed", {
      table: "problem_flags",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to list problem flags: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => mapProblemFlagRow(row as ProblemFlagRow));
}

export async function listProblemFlagsByEntity(
  entityType: ProblemFlag["entityType"],
  entityId: string,
): Promise<ProblemFlag[]> {
  const db = getDatabase();
  const { data, error } = await db
    .from("problem_flags")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[problem-flag-repository] Supabase list by entity failed", {
      table: "problem_flags",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload: {
        entityType,
        entityId,
      },
    });

    throw new Error(`Unable to list problem flags: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => mapProblemFlagRow(row as ProblemFlagRow));
}
