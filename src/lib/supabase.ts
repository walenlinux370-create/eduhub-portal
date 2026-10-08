import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://xpfkzypbroyujcatphhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NkOcpj4VnhdmE3aU5PaI6Q_11V19uRX";

const url =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ||
  (import.meta.env["NEXT_PUBLIC_SUPABASE_URL"] as string | undefined) ||
  SUPABASE_URL;

const key =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ||
  (import.meta.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);

export function requireSupabase() {
  if (!url || !key) throw new Error("Supabase não configurado.");
  return createBrowserClient(url, key);
}
