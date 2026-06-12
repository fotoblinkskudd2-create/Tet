import { NextResponse } from "next/server";
import { syncRepoIssues } from "@/lib/triage";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncRepoIssues();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during sync.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
