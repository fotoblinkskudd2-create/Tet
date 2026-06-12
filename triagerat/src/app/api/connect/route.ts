import { NextRequest, NextResponse } from 'next/server';
import { GithubApiError, parseRepoUrl, verifyRepoAccess } from '@/lib/github';
import { clearConnection, setConnection } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const repoInput = body?.repo as string | undefined;
  const token = body?.token as string | undefined;

  if (!repoInput || !token) {
    return NextResponse.json({ error: 'repo og token er påkrevd' }, { status: 400 });
  }

  let ref;
  try {
    ref = parseRepoUrl(repoInput);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    const info = await verifyRepoAccess(token, ref);
    setConnection(token, ref);
    return NextResponse.json({ connected: true, repo: ref, fullName: info.fullName, private: info.private });
  } catch (err) {
    if (err instanceof GithubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status === 404 ? 404 : 401 });
    }
    return NextResponse.json({ error: 'Uventet feil ved tilkobling' }, { status: 500 });
  }
}

export async function DELETE() {
  clearConnection();
  return NextResponse.json({ connected: false });
}
