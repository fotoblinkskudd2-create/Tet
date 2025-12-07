import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const argumentSchema = z.object({
  claim_id: z.number(),
  side: z.enum(['pro', 'con']),
  content: z.string().min(20).max(1000),
  source_url: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Du må være logget inn' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { claim_id, side, content, source_url } = argumentSchema.parse(body);

    // Verify claim exists
    const claim = db.prepare('SELECT id FROM claims WHERE id = ?').get(claim_id);
    if (!claim) {
      return NextResponse.json(
        { error: 'Påstand ikke funnet' },
        { status: 404 }
      );
    }

    const result = db.prepare(
      'INSERT INTO arguments (claim_id, user_id, side, content, source_url) VALUES (?, ?, ?, ?, ?)'
    ).run(claim_id, user.id, side, content, source_url || null);

    const argument = db.prepare(`
      SELECT a.*, u.username as author_username
      FROM arguments a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ argument });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Kunne ikke opprette argument' },
      { status: 500 }
    );
  }
}
