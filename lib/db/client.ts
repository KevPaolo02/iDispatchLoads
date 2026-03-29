import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";
import { getOptionalEnv, getRequiredEnv } from "@/lib/utils";

type GlobalDatabase = typeof globalThis & {
  __idispatchloadsDb?: SupabaseClient<Database>;
};

function createDatabaseClient() {
  const url =
    getOptionalEnv("SUPABASE_URL") ?? getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url) {
    throw new Error(
      "Missing Supabase URL. Set SUPABASE_URL in Vercel. NEXT_PUBLIC_SUPABASE_URL is accepted as a safe fallback for the project URL.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getDatabase() {
  const globalForDatabase = globalThis as GlobalDatabase;

  if (!globalForDatabase.__idispatchloadsDb) {
    globalForDatabase.__idispatchloadsDb = createDatabaseClient();
  }

  return globalForDatabase.__idispatchloadsDb;
}
