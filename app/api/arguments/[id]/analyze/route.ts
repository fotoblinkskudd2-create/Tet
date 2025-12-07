import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { analyzeArgument } from '@/lib/ai-judge';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get argument with claim info
    const argument = db.prepare(`
      SELECT a.*, c.title as claim_title, c.description as claim_description
      FROM arguments a
      JOIN claims c ON a.claim_id = c.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!argument) {
      return NextResponse.json(
        { error: 'Argument ikke funnet' },
        { status: 404 }
      );
    }

    // Analyze with AI
    const analysis = await analyzeArgument(
      argument.claim_title,
      argument.claim_description,
      argument.content,
      argument.side
    );

    // Update argument with AI results
    db.prepare(`
      UPDATE arguments
      SET ai_score = ?, fallacies = ?, ai_summary = ?
      WHERE id = ?
    `).run(
      analysis.score,
      JSON.stringify(analysis.fallacies),
      analysis.summary,
      id
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke analysere argument' },
      { status: 500 }
    );
  }
}
