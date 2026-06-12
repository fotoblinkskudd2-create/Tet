import { NextResponse } from "next/server";
import { getRepoConfigForDisplay, upsertRepoConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getRepoConfigForDisplay();
    return NextResponse.json({ config });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error loading config.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.repoFullName || typeof body.repoFullName !== "string") {
      return NextResponse.json({ error: "repoFullName is required." }, { status: 400 });
    }

    await upsertRepoConfig({
      repoFullName: body.repoFullName,
      githubToken: typeof body.githubToken === "string" ? body.githubToken : undefined,
      anthropicApiKey: typeof body.anthropicApiKey === "string" ? body.anthropicApiKey : undefined,
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error saving config.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
