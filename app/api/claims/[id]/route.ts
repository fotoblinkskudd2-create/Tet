import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const claim = db.prepare(`
      SELECT c.*, u.username as author_username
      FROM claims c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(id);

    if (!claim) {
      return NextResponse.json(
        { error: 'Påstand ikke funnet' },
        { status: 404 }
      );
    }

    const arguments_list = db.prepare(`
      SELECT
        a.*,
        u.username as author_username,
        COALESCE(SUM(v.value), 0) as vote_count
      FROM arguments a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN votes v ON a.id = v.argument_id
      WHERE a.claim_id = ?
      GROUP BY a.id
      ORDER BY vote_count DESC, a.created_at DESC
    `).all(id);

    return NextResponse.json({
      claim,
      arguments: arguments_list,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke hente påstand' },
      { status: 500 }
    );
  }
}
