import { getRepoConfig } from "./config";
import { listOpenIssues, parseRepoFullName, type GithubIssue } from "./github";
import { toTriageTarget, triageIssue } from "./llm";
import { getSupabaseServerClient } from "./supabase";

export interface SyncResult {
  repoFullName: string;
  fetched: number;
  triaged: number;
  skipped: number;
  errors: { issueNumber: number; message: string }[];
}

/**
 * Sync open issues from GitHub and run AI triage for any issue that doesn't
 * yet have a pending/applied suggestion, or whose content changed since the
 * last sync. This is read-only with respect to GitHub - no labels, comments,
 * or closes are ever performed here.
 */
export async function syncRepoIssues(): Promise<SyncResult> {
  const { repoFullName, githubToken, anthropicApiKey } = await getRepoConfig();
  const { owner, repo } = parseRepoFullName(repoFullName);
  const supabase = getSupabaseServerClient();

  const githubIssues = await listOpenIssues(owner, repo, githubToken);

  const result: SyncResult = {
    repoFullName,
    fetched: githubIssues.length,
    triaged: 0,
    skipped: 0,
    errors: [],
  };

  const { data: existingIssues, error: existingError } = await supabase
    .from("issues")
    .select("id, github_updated_at")
    .eq("repo_full_name", repoFullName);

  if (existingError) {
    throw new Error(`Failed to load existing issues: ${existingError.message}`);
  }

  const existingById = new Map((existingIssues ?? []).map((row) => [row.id, row.github_updated_at]));

  for (const issue of githubIssues) {
    const { error: upsertError } = await supabase.from("issues").upsert(
      {
        id: issue.id,
        repo_full_name: repoFullName,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        author: issue.user,
        state: issue.state,
        html_url: issue.html_url,
        github_labels: issue.labels,
        github_created_at: issue.created_at,
        github_updated_at: issue.updated_at,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "repo_full_name,number" }
    );

    if (upsertError) {
      result.errors.push({ issueNumber: issue.number, message: `Failed to save issue: ${upsertError.message}` });
      continue;
    }
  }

  const { data: existingSuggestions, error: suggestionsError } = await supabase
    .from("triage_suggestions")
    .select("issue_id, status")
    .in(
      "issue_id",
      githubIssues.map((issue) => issue.id)
    );

  if (suggestionsError) {
    throw new Error(`Failed to load existing suggestions: ${suggestionsError.message}`);
  }

  const suggestionByIssueId = new Map((existingSuggestions ?? []).map((row) => [row.issue_id, row.status]));

  for (const issue of githubIssues) {
    const previousUpdatedAt = existingById.get(issue.id);
    const existingStatus = suggestionByIssueId.get(issue.id);
    const contentChanged = previousUpdatedAt !== issue.updated_at;
    const needsTriage = !existingStatus || (contentChanged && existingStatus !== "applied");

    if (!needsTriage) {
      result.skipped += 1;
      continue;
    }

    try {
      const otherIssues = githubIssues.filter((other) => other.id !== issue.id).map(toTriageTarget);
      const triage = await triageIssue(toTriageTarget(issue), otherIssues, anthropicApiKey);

      const { error: suggestionError } = await supabase.from("triage_suggestions").upsert(
        {
          issue_id: issue.id,
          category: triage.category,
          priority: triage.priority,
          is_security: triage.is_security,
          suggested_labels: triage.suggested_labels,
          maintainer_response: triage.maintainer_response,
          reproduction_request: triage.reproduction_request,
          duplicate_of: triage.duplicate_of,
          duplicate_confidence: triage.duplicate_confidence,
          suggested_assignee_type: triage.suggested_assignee_type,
          rationale: triage.rationale,
          status: "pending",
          actions: {},
          created_at: new Date().toISOString(),
          reviewed_at: null,
          reviewed_by: null,
        },
        { onConflict: "issue_id" }
      );

      if (suggestionError) {
        result.errors.push({ issueNumber: issue.number, message: `Failed to save suggestion: ${suggestionError.message}` });
        continue;
      }

      result.triaged += 1;
    } catch (err) {
      result.errors.push({
        issueNumber: issue.number,
        message: err instanceof Error ? err.message : "Unknown triage error",
      });
    }
  }

  return result;
}

export type { GithubIssue };
