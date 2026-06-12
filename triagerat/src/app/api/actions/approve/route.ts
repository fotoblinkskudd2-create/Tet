import { NextRequest, NextResponse } from 'next/server';
import { addLabelsToIssue, postIssueComment } from '@/lib/github';
import { getConnection } from '@/lib/session';
import { getSupabaseClient } from '@/lib/supabase';
import type { ActionType, TriageSuggestionRecord } from '@/lib/types';

type CommentAction = 'none' | 'maintainer_response' | 'reproduction_request' | 'duplicate';

interface ApproveBody {
  suggestionIds: string[];
  dryRun: boolean;
  applyLabels: boolean;
  commentAction: CommentAction;
  confirmPublicSecurityPost?: boolean;
}

interface PerSuggestionResult {
  suggestionId: string;
  issueNumber: number;
  status: string;
  actions: { type: ActionType; dryRun: boolean; result: string }[];
}

function buildDuplicateComment(suggestion: TriageSuggestionRecord): string | null {
  if (!suggestion.duplicate_of_issue_number) return null;
  return `This looks like a duplicate of #${suggestion.duplicate_of_issue_number}. Closing/merging is left to a maintainer to confirm — flagging here for visibility.`;
}

function commentBodyFor(suggestion: TriageSuggestionRecord, action: CommentAction): string | null {
  switch (action) {
    case 'maintainer_response':
      return suggestion.maintainer_response || null;
    case 'reproduction_request':
      return suggestion.reproduction_request || null;
    case 'duplicate':
      return buildDuplicateComment(suggestion);
    default:
      return null;
  }
}

function actionTypeFor(commentAction: CommentAction): ActionType {
  switch (commentAction) {
    case 'reproduction_request':
      return 'post_reproduction_request';
    case 'duplicate':
      return 'mark_duplicate';
    default:
      return 'post_comment';
  }
}

export async function POST(req: NextRequest) {
  const connection = getConnection();
  if (!connection) {
    return NextResponse.json({ error: 'Ikke tilkoblet. Koble til et repo først.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as ApproveBody | null;
  if (!body?.suggestionIds || !Array.isArray(body.suggestionIds) || body.suggestionIds.length === 0) {
    return NextResponse.json({ error: 'suggestionIds (string[]) er påkrevd' }, { status: 400 });
  }

  const dryRun = body.dryRun !== false; // default to dry-run for safety
  const applyLabels = Boolean(body.applyLabels);
  const commentAction = body.commentAction ?? 'none';
  const confirmPublicSecurityPost = Boolean(body.confirmPublicSecurityPost);

  const { token, ref } = connection;
  const supabase = getSupabaseClient();

  const { data: suggestions, error: fetchError } = await supabase
    .from('triage_suggestions')
    .select('*')
    .in('id', body.suggestionIds)
    .eq('repo_owner', ref.owner)
    .eq('repo_name', ref.repo);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!suggestions || suggestions.length === 0) {
    return NextResponse.json({ error: 'Fant ingen forslag med oppgitte id-er' }, { status: 404 });
  }

  const results: PerSuggestionResult[] = [];

  for (const suggestion of suggestions as TriageSuggestionRecord[]) {
    const actions: PerSuggestionResult['actions'] = [];
    let hadError = false;

    // --- Label suggestion -------------------------------------------------
    if (applyLabels && suggestion.suggested_labels?.length) {
      const actionType: ActionType = 'add_labels';
      const payload = { labels: suggestion.suggested_labels };

      if (dryRun) {
        actions.push({ type: actionType, dryRun: true, result: `Preview: would add labels [${suggestion.suggested_labels.join(', ')}]` });
      } else {
        try {
          await addLabelsToIssue(token, ref, suggestion.issue_number, suggestion.suggested_labels);
          actions.push({ type: actionType, dryRun: false, result: 'ok' });
        } catch (err) {
          hadError = true;
          actions.push({ type: actionType, dryRun: false, result: `error: ${(err as Error).message}` });
        }
      }

      await supabase.from('action_history').insert({
        suggestion_id: suggestion.id,
        repo_owner: ref.owner,
        repo_name: ref.repo,
        issue_number: suggestion.issue_number,
        action_type: actionType,
        payload,
        dry_run: dryRun,
        result: actions[actions.length - 1].result,
      });
    }

    // --- Comment action (maintainer response / repro request / duplicate) -
    if (commentAction !== 'none') {
      const actionType = actionTypeFor(commentAction);
      const commentBody = commentBodyFor(suggestion, commentAction);

      if (!commentBody) {
        actions.push({ type: actionType, dryRun, result: 'skipped: ingen tekst tilgjengelig for denne handlingen' });
      } else if (suggestion.is_security && !confirmPublicSecurityPost) {
        // SAFETY: never post security info publicly without explicit confirmation.
        const result = 'blocked: dette issuet er klassifisert som "Security concern". Kommentaren ble IKKE postet offentlig. ' +
          'Bekreft eksplisitt ("confirmPublicSecurityPost") hvis du har vurdert innholdet og ønsker å publisere det.';
        actions.push({ type: actionType, dryRun, result });
        await supabase.from('action_history').insert({
          suggestion_id: suggestion.id,
          repo_owner: ref.owner,
          repo_name: ref.repo,
          issue_number: suggestion.issue_number,
          action_type: actionType,
          payload: { body: commentBody },
          dry_run: dryRun,
          result,
        });
      } else if (dryRun) {
        const preview = `Preview: would post comment: "${commentBody.slice(0, 200)}${commentBody.length > 200 ? '...' : ''}"`;
        actions.push({ type: actionType, dryRun: true, result: preview });
        await supabase.from('action_history').insert({
          suggestion_id: suggestion.id,
          repo_owner: ref.owner,
          repo_name: ref.repo,
          issue_number: suggestion.issue_number,
          action_type: actionType,
          payload: { body: commentBody },
          dry_run: true,
          result: preview,
        });
      } else {
        try {
          await postIssueComment(token, ref, suggestion.issue_number, commentBody);
          actions.push({ type: actionType, dryRun: false, result: 'ok' });
          await supabase.from('action_history').insert({
            suggestion_id: suggestion.id,
            repo_owner: ref.owner,
            repo_name: ref.repo,
            issue_number: suggestion.issue_number,
            action_type: actionType,
            payload: { body: commentBody },
            dry_run: false,
            result: 'ok',
          });
        } catch (err) {
          hadError = true;
          const result = `error: ${(err as Error).message}`;
          actions.push({ type: actionType, dryRun: false, result });
          await supabase.from('action_history').insert({
            suggestion_id: suggestion.id,
            repo_owner: ref.owner,
            repo_name: ref.repo,
            issue_number: suggestion.issue_number,
            action_type: actionType,
            payload: { body: commentBody },
            dry_run: false,
            result,
          });
        }
      }
    }

    // --- Update suggestion status ------------------------------------------
    let newStatus = suggestion.status;
    if (!hadError) {
      newStatus = dryRun ? 'approved' : 'applied';
    }

    const { data: updated, error: updateError } = await supabase
      .from('triage_suggestions')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', suggestion.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    results.push({
      suggestionId: suggestion.id,
      issueNumber: suggestion.issue_number,
      status: updated.status,
      actions,
    });
  }

  return NextResponse.json({ dryRun, results });
}

export async function GET() {
  return NextResponse.json(
    {
      error:
        'GET er ikke støttet på dette endepunktet. Bruk POST med { suggestionIds, dryRun, applyLabels, commentAction }.',
    },
    { status: 405 }
  );
}
