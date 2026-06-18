import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

/**
 * Returns the signed-in user's profile, creating it on first sight.
 * This makes onboarding resilient even if the Clerk webhook isn't set up —
 * the row is upserted lazily the first time a logged-in user loads the app.
 */
export async function ensureProfile(): Promise<Profile | null> {
  const user = await currentUser();
  if (!user) return null;

  const admin = createAdminSupabase();
  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = !!email && adminEmails.includes(email.toLowerCase());

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  const { data, error } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        avatar_url: user.imageUrl ?? null,
        ...(isAdmin ? { role: "admin" } : {}),
      },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) {
    console.error("ensureProfile error", error.message);
    return null;
  }
  return data as Profile;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}
