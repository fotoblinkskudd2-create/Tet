import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("triage_suggestions")
      .select("*, issues(*)")
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });
    }

    return NextResponse.json({ suggestion: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error fetching suggestion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const EDITABLE_FIELDS = [
  "maintainer_response",
  "reproduction_request",
  "suggested_labels",
  "category",
  "priority",
  "suggested_assignee_type",
] as const;

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No editable fields provided." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("triage_suggestions")
      .update(updates)
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestion: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error updating suggestion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
