import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Uses Clerk's native third-party auth: every request carries the signed-in
 * user's Clerk session token, and Postgres RLS reads `auth.jwt()->>'sub'`.
 *
 * No JWT templates, no service keys — RLS does the protecting.
 */
export async function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    },
  );
}
