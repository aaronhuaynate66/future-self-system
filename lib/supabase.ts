import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Cliente lazy — solo se crea si hay credenciales
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

export const supabase = {
  from: (table: string) => getSupabase()?.from(table) ?? ({
    upsert: async () => ({}),
    delete: () => ({ eq: async () => ({}) }),
    select: () => ({ eq: () => ({ order: async () => ({ data: null, error: "no client" }) }) }),
  } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
};
