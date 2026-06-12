import { NextResponse } from 'next/server';
import { fetchOpenIssues, GithubApiError } from '@/lib/github';
import { getConnection } from '@/lib/session';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: 'Ikke tilkoblet. Koble til et repo først.' }, { status: 401 });
  }

  const { token, ref } = connection;

  let issues;
  try {
    issues = await fetchOpenIssues(token, ref);
  } catch (err) {
    if (err instanceof GithubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Kunne ikke hente issues' }, { status: 500 });
  }

  let suggestionByNumber = new Map<number, { status: string; category: string; priority: string }>();
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('triage_suggestions')
      .select('issue_number, status, category, priority')
      .eq('repo_owner', ref.owner)
      .eq('repo_name', ref.repo);

    if (!error && data) {
      suggestionByNumber = new Map(data.map((row) => [row.issue_number, row]));
    }
  } catch {
    // Supabase optional for the inbox view; suggestions will simply show as
    // "not triaged" if it's not configured yet.
  }

  const result = issues.map((issue) => {
    const existing = suggestionByNumber.get(issue.number);
    return {
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      author: issue.user?.login ?? null,
      labels: issue.labels.map((l) => l.name),
      createdAt: issue.created_at,
      comments: issue.comments,
      triageStatus: existing?.status ?? null,
      category: existing?.category ?? null,
      priority: existing?.priority ?? null,
    };
  });

  return NextResponse.json({ repo: ref, issues: result });
}
