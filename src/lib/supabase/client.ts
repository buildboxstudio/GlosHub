import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when Supabase credentials are configured. When false the app
 * falls back to DEMO MODE (mock data + local login) so it runs instantly.
 */
export const isSupabaseEnabled = Boolean(url && anon);

export function createClient() {
  if (!isSupabaseEnabled) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }
  return createBrowserClient(url as string, anon as string);
}
