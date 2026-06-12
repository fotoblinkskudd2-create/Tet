import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenIssues, GithubApiError } from '@/lib/github';
import { getConnection } from '@/lib/session';
import { getSupabaseClient } from '@/lib/supabase';
import { triageIssue } from '@/lib/triage';

export async function POST(req: NextRequest) {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: 'Ikke tilkoblet. Koble til et repo først.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const issueNumbers = body?.issueNumbers as number[] | undefined;
  if (!issueNumbers || !Array.isArray(issueNumbers) || issueNumbers.length === 0) {
    return NextResponse.json({ error: 'issueNumbers (number[]) er påkrevd' }, { status: 400 });
  }

  const { token, ref } = connection;

  let allIssues;
  try {
    allIssues = await fetchOpenIssues(token, ref);
  } catch (err) {
    if (err instanceof GithubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Kunne ikke hente issues' }, { status: 500 });
  }

  const candidates = allIssues.map((i) => ({ number: i.number, title: i.title }));
  const targets = allIssues.filter((i) => issueNumbers.includes(i.number));

  if (targets.length === 0) {
    return NextResponse.json({ error: 'Fant ingen av de oppgitte issues blant åpne issues' }, { status: 404 });
  }

  const supabase = getSupabaseClient();
  const results = [];

  for (const issue of targets) {
    const { result, engine } = await triageIssue(issue, candidates);

    const row = {
      repo_owner: ref.owner,
      repo_name: ref.repo,
      issue_number: issue.number,
      issue_title: issue.title,
      issue_url: issue.html_url,
      issue_author: issue.user?.login ?? null,
      category: result.category,
      priority: result.priority,
      is_security: result.isSecurity,
      suggested_labels: result.suggestedLabels,
      maintainer_response: result.maintainerResponse,
      reproduction_request: result.reproductionRequest,
      duplicate_of_issue_number: result.duplicateOf?.issueNumber ?? null,
      duplicate_confidence: result.duplicateOf?.confidence ?? null,
      suggested_assignee_type: result.suggestedAssigneeType,
      rationale: result.rationale,
      engine,
      status: 'pending',
      reviewed_at: null,
    };

    const { data, error } = await supabase
      .from('triage_suggestions')
      .upsert(row, { onConflict: 'repo_owner,repo_name,issue_number' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Kunne ikke lagre forslag for #${issue.number}: ${error.message}` }, { status: 500 });
    }

    results.push(data);
  }

  return NextResponse.json({ suggestions: results });
}
