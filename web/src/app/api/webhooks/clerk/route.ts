import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/profile";

type ClerkEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 501 },
    );
  }

  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id") ?? "",
    "svix-timestamp": headerPayload.get("svix-timestamp") ?? "",
    "svix-signature": headerPayload.get("svix-signature") ?? "",
  };
  const body = await req.text();

  let event: ClerkEvent;
  try {
    event = new Webhook(secret).verify(body, svixHeaders) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  if (event.type === "user.created" || event.type === "user.updated") {
    const { data } = event;
    const primaryEmail =
      data.email_addresses?.find(
        (e) => e.id === data.primary_email_address_id,
      )?.email_address ??
      data.email_addresses?.[0]?.email_address ??
      null;

    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    await admin.from("profiles").upsert(
      {
        id: data.id,
        email: primaryEmail,
        full_name: fullName,
        avatar_url: data.image_url ?? null,
        ...(isAdminEmail(primaryEmail) ? { role: "admin" } : {}),
      },
      { onConflict: "id" },
    );
  }

  if (event.type === "user.deleted") {
    await admin.from("profiles").delete().eq("id", event.data.id);
  }

  return NextResponse.json({ received: true });
}
