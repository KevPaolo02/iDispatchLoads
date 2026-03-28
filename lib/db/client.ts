import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";
import { getRequiredEnv } from "@/lib/utils";

type GlobalDatabase = typeof globalThis & {
  __idispatchloadsDb?: SupabaseClient<Database>;
};

function createDatabaseClient() {
  const url = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

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
