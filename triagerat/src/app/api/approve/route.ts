import { NextResponse } from "next/server";
import { buildActionPlan, executeActionPlan, rejectSuggestion, SecurityActionBlockedError } from "@/lib/approve";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ApproveRequestBody, DbIssue, DbTriageSuggestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApproveRequestBody;

    if (!body.suggestionId) {
      return NextResponse.json({ error: "suggestionId is required." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: suggestion, error: suggestionError } = await supabase
      .from("triage_suggestions")
      .select("*, issues(*)")
      .eq("id", body.suggestionId)
      .maybeSingle();

    if (suggestionError) {
      return NextResponse.json({ error: suggestionError.message }, { status: 500 });
    }
    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });
    }

    const issue = suggestion.issues as DbIssue;
    const suggestionRow = suggestion as unknown as DbTriageSuggestion;

    if (suggestionRow.status === "applied") {
      return NextResponse.json({ error: "This suggestion has already been applied." }, { status: 409 });
    }

    if (body.reject) {
      if (body.dryRun) {
        return NextResponse.json({ preview: [{ actionType: "reject", description: `Mark issue #${issue.number} suggestion as rejected.`, payload: {} }] });
      }
      await rejectSuggestion(issue, suggestionRow);
      return NextResponse.json({ status: "rejected" });
    }

    let plan;
    try {
      plan = buildActionPlan(issue, suggestionRow, body.actions);
    } catch (err) {
      if (err instanceof SecurityActionBlockedError) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      throw err;
    }

    if (plan.length === 0) {
      return NextResponse.json({ error: "No actions selected." }, { status: 400 });
    }

    if (body.dryRun) {
      return NextResponse.json({ preview: plan });
    }

    const outcomes = await executeActionPlan(issue, suggestionRow, plan);
    return NextResponse.json({ status: "applied", outcomes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error processing approval.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
