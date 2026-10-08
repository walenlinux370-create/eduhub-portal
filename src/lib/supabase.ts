import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://xpfkzypbroyujcatphhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NkOcpj4VnhdmE3aU5PaI6Q_11V19uRX";

export const isSupabaseConfigured = true;

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function requireSupabase() {
  if (typeof window === "undefined") {
    throw new Error("O cliente Supabase do navegador só pode ser usado no browser.");
  }

  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }

  return browserClient;
}
