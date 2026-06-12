import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/session';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: 'Ikke tilkoblet. Koble til et repo først.' }, { status: 401 });
  }

  const { ref } = connection;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('action_history')
    .select('*')
    .eq('repo_owner', ref.owner)
    .eq('repo_name', ref.repo)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data });
}
