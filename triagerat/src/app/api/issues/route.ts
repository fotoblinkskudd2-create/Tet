import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const { data, error } = await supabase
      .from("issues")
      .select("*, triage_suggestions(*)")
      .order("number", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let issues = data ?? [];
    if (status) {
      issues = issues.filter((issue) => {
        const suggestion = Array.isArray(issue.triage_suggestions) ? issue.triage_suggestions[0] : null;
        return suggestion?.status === status;
      });
    }

    return NextResponse.json({ issues });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error fetching issues.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
