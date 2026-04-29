import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@five-apps/database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0"));
  const limit = 20;

  const entries = await prisma.gonzoEntry.findMany({
    where: { isPublic: true },
    include: { gonzoScore: true },
    orderBy: { upvotes: "desc" },
    take: limit,
    skip: page * limit,
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { text, metrics, isPublic } = await req.json();

  const entry = await prisma.gonzoEntry.create({
    data: {
      userId: "anonymous",
      content: text,
      isPublic: !!isPublic,
      gonzoScore: {
        create: {
          rawness: metrics.rawness,
          lyricism: metrics.lyricism,
          sensoryDetail: metrics.sensoryDetail,
          honesty: metrics.honesty,
          danceMetaphors: metrics.danceMetaphors,
          totalScore: metrics.totalScore,
          feedback: metrics.feedback,
          badge: metrics.badge,
        },
      },
    },
  });

  return NextResponse.json({ id: entry.id }, { status: 201 });
}
