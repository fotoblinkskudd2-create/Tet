import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/session';

export async function GET() {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({ connected: true, repo: connection.ref });
}
