import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { newsAggregator } from "@/services/news-aggregator";

const QuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = QuerySchema.parse(searchParams);

    const stories = await newsAggregator.getPublishedStories(
      query.limit,
      query.offset,
      query.category
    );

    return NextResponse.json({
      stories,
      meta: {
        limit: query.limit,
        offset: query.offset,
        count: stories.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
