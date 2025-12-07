import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const voteSchema = z.object({
  argument_id: z.number(),
  value: z.number().refine((val) => val === 1 || val === -1),
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
    const { argument_id, value } = voteSchema.parse(body);

    // Check if argument exists
    const argument = db.prepare('SELECT id FROM arguments WHERE id = ?').get(argument_id);
    if (!argument) {
      return NextResponse.json(
        { error: 'Argument ikke funnet' },
        { status: 404 }
      );
    }

    // Upsert vote
    db.prepare(`
      INSERT INTO votes (argument_id, user_id, value)
      VALUES (?, ?, ?)
      ON CONFLICT(argument_id, user_id)
      DO UPDATE SET value = excluded.value
    `).run(argument_id, user.id, value);

    // Get updated vote count
    const result = db.prepare(`
      SELECT COALESCE(SUM(value), 0) as vote_count
      FROM votes
      WHERE argument_id = ?
    `).get(argument_id) as any;

    return NextResponse.json({ vote_count: result.vote_count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Kunne ikke registrere stemme' },
      { status: 500 }
    );
  }
}
