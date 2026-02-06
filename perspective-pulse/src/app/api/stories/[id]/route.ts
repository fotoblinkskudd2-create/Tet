import { NextRequest, NextResponse } from "next/server";
import { newsAggregator } from "@/services/news-aggregator";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await newsAggregator.getStoryById(params.id);

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Failed to fetch story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
