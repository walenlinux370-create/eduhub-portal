import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://xpfkzypbroyujcatphhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_NkOcpj4VnhdmE3aU5PaI6Q_11V19uRX";

export function createServerSupabase() {
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies, headers) {
        cookies.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          setResponseHeader(name, value);
        });
      },
    },
  });
}
