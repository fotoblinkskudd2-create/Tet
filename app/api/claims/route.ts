import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const claimSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(2000),
  tags: z.string().optional(),
});

export async function GET() {
  try {
    const claims = db.prepare(`
      SELECT
        c.*,
        u.username as author_username,
        (SELECT COUNT(*) FROM arguments WHERE claim_id = c.id AND side = 'pro') as pro_count,
        (SELECT COUNT(*) FROM arguments WHERE claim_id = c.id AND side = 'con') as con_count
      FROM claims c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `).all();

    return NextResponse.json({ claims });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke hente påstander' },
      { status: 500 }
    );
  }
}

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
    const { title, description, tags } = claimSchema.parse(body);

    const result = db.prepare(
      'INSERT INTO claims (user_id, title, description, tags) VALUES (?, ?, ?, ?)'
    ).run(user.id, title, description, tags || '');

    const claim = db.prepare(`
      SELECT c.*, u.username as author_username
      FROM claims c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ claim });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Kunne ikke opprette påstand' },
      { status: 500 }
    );
  }
}
