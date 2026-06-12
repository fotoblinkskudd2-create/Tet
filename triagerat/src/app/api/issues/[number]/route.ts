import { NextResponse } from "next/server";
import { getRepoConfig } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { number: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const issueNumber = Number(params.number);
    if (!Number.isInteger(issueNumber)) {
      return NextResponse.json({ error: "Invalid issue number." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { repoFullName } = await getRepoConfig();

    const { data, error } = await supabase
      .from("issues")
      .select("*, triage_suggestions(*)")
      .eq("repo_full_name", repoFullName)
      .eq("number", issueNumber)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Issue not found." }, { status: 404 });
    }

    return NextResponse.json({ issue: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error fetching issue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
