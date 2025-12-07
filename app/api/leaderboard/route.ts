import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Top debaters by AI score
    const topDebaters = db.prepare(`
      SELECT
        u.username,
        u.rating,
        COUNT(a.id) as argument_count,
        AVG(COALESCE(a.ai_score, 5)) as avg_ai_score
      FROM users u
      LEFT JOIN arguments a ON u.id = a.user_id
      GROUP BY u.id
      HAVING argument_count > 0
      ORDER BY avg_ai_score DESC, argument_count DESC
      LIMIT 10
    `).all();

    // Most controversial claims (most arguments)
    const topClaims = db.prepare(`
      SELECT
        c.id,
        c.title,
        u.username as author,
        COUNT(a.id) as argument_count,
        (SELECT COUNT(*) FROM arguments WHERE claim_id = c.id AND side = 'pro') as pro_count,
        (SELECT COUNT(*) FROM arguments WHERE claim_id = c.id AND side = 'con') as con_count
      FROM claims c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN arguments a ON c.id = a.claim_id
      GROUP BY c.id
      ORDER BY argument_count DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      topDebaters,
      topClaims,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke hente leaderboard' },
      { status: 500 }
    );
  }
}
