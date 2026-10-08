import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://xpfkzypbroyujcatphhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NkOcpj4VnhdmE3aU5PaI6Q_11V19uRX";

export const isSupabaseConfigured = true;

export function requireSupabase() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
