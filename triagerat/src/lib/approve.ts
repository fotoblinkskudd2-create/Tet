import { addLabels, closeIssue, createComment, parseRepoFullName } from "./github";
import { getRepoConfig } from "./config";
import { getSupabaseServerClient } from "./supabase";
import type { ActionResult, ApprovalActions, ApprovePreviewItem, DbIssue, DbTriageSuggestion } from "./types";

export class SecurityActionBlockedError extends Error {}

/**
 * Build the list of GitHub operations implied by the selected approval actions.
 *
 * Hard safety rule: if the suggestion is flagged `is_security`, public-comment
 * actions (maintainer response / reproduction request) are never allowed here -
 * security info must be handled through a private channel, not posted to the issue.
 */
export function buildActionPlan(
  issue: DbIssue,
  suggestion: DbTriageSuggestion,
  actions: ApprovalActions
): ApprovePreviewItem[] {
  if (suggestion.is_security && (actions.postMaintainerResponse || actions.postReproductionRequest)) {
    throw new SecurityActionBlockedError(
      "This issue is flagged as a security concern. TriageRat will not post comments publicly on it - " +
        "handle it through a private security disclosure channel instead."
    );
  }

  const plan: ApprovePreviewItem[] = [];

  if (actions.addLabels && suggestion.suggested_labels.length > 0) {
    plan.push({
      actionType: "add_labels",
      description: `Add labels [${suggestion.suggested_labels.join(", ")}] to issue #${issue.number}.`,
      payload: { labels: suggestion.suggested_labels },
    });
  }

  if (actions.postMaintainerResponse && suggestion.maintainer_response) {
    plan.push({
      actionType: "post_comment",
      description: `Post maintainer response comment on issue #${issue.number}.`,
      payload: { body: suggestion.maintainer_response },
    });
  }

  if (actions.postReproductionRequest && suggestion.reproduction_request) {
    plan.push({
      actionType: "post_reproduction_request",
      description: `Post reproduction request comment on issue #${issue.number}.`,
      payload: { body: suggestion.reproduction_request },
    });
  }

  if (actions.closeIssue) {
    plan.push({
      actionType: "close_issue",
      description: `Close issue #${issue.number}.`,
      payload: {},
    });
  }

  return plan;
}

/**
 * Execute a previously-built action plan against GitHub, recording each
 * outcome to `action_history` and updating the suggestion status to 'applied'.
 * Never call this without explicit user approval (dryRun === false).
 */
export async function executeActionPlan(
  issue: DbIssue,
  suggestion: DbTriageSuggestion,
  plan: ApprovePreviewItem[]
): Promise<{ actionType: string; result: ActionResult; error?: string }[]> {
  const { repoFullName, githubToken } = await getRepoConfig();
  const { owner, repo } = parseRepoFullName(repoFullName);
  const supabase = getSupabaseServerClient();

  const outcomes: { actionType: string; result: ActionResult; error?: string }[] = [];

  for (const step of plan) {
    let result: ActionResult = "success";
    let errorMessage: string | undefined;

    try {
      switch (step.actionType) {
        case "add_labels":
          await addLabels(owner, repo, issue.number, step.payload.labels as string[], githubToken);
          break;
        case "post_comment":
        case "post_reproduction_request":
          await createComment(owner, repo, issue.number, step.payload.body as string, githubToken);
          break;
        case "close_issue":
          await closeIssue(owner, repo, issue.number, githubToken);
          break;
        default:
          throw new Error(`Unknown action type: ${step.actionType}`);
      }
    } catch (err) {
      result = "error";
      errorMessage = err instanceof Error ? err.message : "Unknown error";
    }

    const { error: historyError } = await supabase.from("action_history").insert({
      issue_id: issue.id,
      suggestion_id: suggestion.id,
      action_type: step.actionType,
      payload: step.payload,
      result,
      error_message: errorMessage ?? null,
    });

    if (historyError) {
      throw new Error(`Failed to record action history: ${historyError.message}`);
    }

    outcomes.push({ actionType: step.actionType, result, error: errorMessage });
  }

  const { error: updateError } = await supabase
    .from("triage_suggestions")
    .update({
      status: "applied",
      actions: { applied: plan.map((step) => step.actionType) },
      reviewed_at: new Date().toISOString(),
      reviewed_by: "maintainer",
    })
    .eq("id", suggestion.id);

  if (updateError) {
    throw new Error(`Failed to update suggestion status: ${updateError.message}`);
  }

  return outcomes;
}

export async function rejectSuggestion(issue: DbIssue, suggestion: DbTriageSuggestion): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { error: historyError } = await supabase.from("action_history").insert({
    issue_id: issue.id,
    suggestion_id: suggestion.id,
    action_type: "reject",
    payload: {},
    result: "success",
  });

  if (historyError) {
    throw new Error(`Failed to record action history: ${historyError.message}`);
  }

  const { error: updateError } = await supabase
    .from("triage_suggestions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "maintainer",
    })
    .eq("id", suggestion.id);

  if (updateError) {
    throw new Error(`Failed to update suggestion status: ${updateError.message}`);
  }
}
