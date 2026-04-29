import { NextRequest, NextResponse } from "next/server";
import { extractEntities } from "@five-apps/ai";
import { prisma } from "@five-apps/database";

export async function GET() {
  const notes = await prisma.note.findMany({
    include: { entities: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const { content, title } = await req.json();

  if (!content || content.length < 10) {
    return NextResponse.json({ error: "Content too short" }, { status: 400 });
  }

  const existingNotes = await prisma.note.findMany({
    select: { title: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  const existingNodes = existingNotes.map((n) => n.title ?? "").filter(Boolean);

  const extraction = await extractEntities(content, existingNodes);

  const note = await prisma.note.create({
    data: {
      userId: "local",
      content,
      title: title || extraction.summary.slice(0, 80),
      summary: extraction.summary,
      entities: {
        create: extraction.entities.map((e) => ({
          text: e.text,
          type: e.type,
          confidence: e.confidence,
        })),
      },
    },
  });

  return NextResponse.json({ id: note.id, ...extraction }, { status: 201 });
}
