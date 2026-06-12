import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/session';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: 'Ikke tilkoblet. Koble til et repo først.' }, { status: 401 });
  }

  const { ref } = connection;
  const status = req.nextUrl.searchParams.get('status');

  const supabase = getSupabaseClient();
  let query = supabase
    .from('triage_suggestions')
    .select('*')
    .eq('repo_owner', ref.owner)
    .eq('repo_name', ref.repo)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data });
}
