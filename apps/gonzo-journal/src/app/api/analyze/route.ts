import { NextRequest, NextResponse } from "next/server";
import { analyzeGonzoEntry } from "@five-apps/ai";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string" || text.trim().length < 50) {
    return NextResponse.json({ error: "Text too short" }, { status: 400 });
  }

  if (text.length > 10_000) {
    return NextResponse.json({ error: "Text too long (max 10k chars)" }, { status: 400 });
  }

  const metrics = await analyzeGonzoEntry(text);
  return NextResponse.json(metrics);
}
