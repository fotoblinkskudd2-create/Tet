import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("action_history")
      .select("*, issues(number, title, html_url)")
      .order("performed_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error fetching history.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
