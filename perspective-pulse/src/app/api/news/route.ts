import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processNewsQuery } from "@/lib/ai/orchestrator";

const SearchSchema = z.object({
  query: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const { query } = SearchSchema.parse(body);

    const storyIds = await processNewsQuery(query);

    return NextResponse.json({
      message: `Processed ${storyIds.length} stories`,
      storyIds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Failed to process news query:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
