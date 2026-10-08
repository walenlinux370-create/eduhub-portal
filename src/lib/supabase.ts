import { createBrowserClient } from "@supabase/ssr";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

export function requireSupabase() {
  if (!url || !key) throw new Error("Supabase não configurado.");
  return createBrowserClient(url, key);
}
