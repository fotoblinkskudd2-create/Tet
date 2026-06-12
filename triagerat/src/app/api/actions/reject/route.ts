import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/session';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: 'Ikke tilkoblet. Koble til et repo først.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const suggestionIds = body?.suggestionIds as string[] | undefined;
  if (!suggestionIds || !Array.isArray(suggestionIds) || suggestionIds.length === 0) {
    return NextResponse.json({ error: 'suggestionIds (string[]) er påkrevd' }, { status: 400 });
  }

  const { ref } = connection;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('triage_suggestions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .in('id', suggestionIds)
    .eq('repo_owner', ref.owner)
    .eq('repo_name', ref.repo)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data });
}
