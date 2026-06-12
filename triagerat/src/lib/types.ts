export type IssueCategory =
  | "Bug"
  | "Feature"
  | "Question"
  | "Duplicate"
  | "Invalid"
  | "Needs reproduction"
  | "Security concern"
  | "Documentation";

export const ISSUE_CATEGORIES: IssueCategory[] = [
  "Bug",
  "Feature",
  "Question",
  "Duplicate",
  "Invalid",
  "Needs reproduction",
  "Security concern",
  "Documentation",
];

export type IssuePriority = "P0" | "P1" | "P2" | "P3";

export const ISSUE_PRIORITIES: IssuePriority[] = ["P0", "P1", "P2", "P3"];

export type AssigneeType =
  | "Maintainer"
  | "Core team"
  | "Community contributor"
  | "Security team"
  | "Documentation team"
  | "Unassigned";

export type SuggestionStatus = "pending" | "approved" | "rejected" | "applied";

export type ActionType =
  | "add_labels"
  | "post_comment"
  | "post_reproduction_request"
  | "close_issue"
  | "reject";

export type ActionResult = "success" | "error" | "dry_run";

export interface DbIssue {
  id: number;
  repo_full_name: string;
  number: number;
  title: string;
  body: string | null;
  author: string | null;
  state: string;
  html_url: string;
  github_labels: string[];
  github_updated_at: string | null;
  github_created_at: string | null;
  synced_at: string;
}

export interface DbTriageSuggestion {
  id: string;
  issue_id: number;
  category: IssueCategory;
  priority: IssuePriority;
  is_security: boolean;
  suggested_labels: string[];
  maintainer_response: string | null;
  reproduction_request: string | null;
  duplicate_of: number | null;
  duplicate_confidence: number | null;
  suggested_assignee_type: AssigneeType | null;
  rationale: string | null;
  status: SuggestionStatus;
  actions: Record<string, unknown>;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface DbActionHistory {
  id: string;
  issue_id: number | null;
  suggestion_id: string | null;
  action_type: ActionType;
  payload: Record<string, unknown> | null;
  result: ActionResult;
  error_message: string | null;
  performed_at: string;
  performed_by: string;
}

export interface IssueWithSuggestion extends DbIssue {
  triage_suggestions: DbTriageSuggestion[] | null;
}

/** Approval actions a maintainer can choose to apply for a suggestion. */
export interface ApprovalActions {
  addLabels: boolean;
  postMaintainerResponse: boolean;
  postReproductionRequest: boolean;
  closeIssue: boolean;
}

export interface ApproveRequestBody {
  suggestionId: string;
  actions: ApprovalActions;
  dryRun: boolean;
  /** If true, mark the suggestion as rejected and skip all GitHub writes. */
  reject?: boolean;
}

export interface ApprovePreviewItem {
  actionType: ActionType;
  description: string;
  payload: Record<string, unknown>;
}

export interface LlmTriageResult {
  category: IssueCategory;
  priority: IssuePriority;
  is_security: boolean;
  suggested_labels: string[];
  maintainer_response: string;
  reproduction_request: string | null;
  duplicate_of: number | null;
  duplicate_confidence: number | null;
  suggested_assignee_type: AssigneeType;
  rationale: string;
}
