export type IssueCategory =
  | 'Bug'
  | 'Feature'
  | 'Question'
  | 'Duplicate'
  | 'Invalid'
  | 'Needs reproduction'
  | 'Security concern'
  | 'Documentation';

export type IssuePriority = 'P0 critical' | 'P1 important' | 'P2 normal' | 'P3 low';

export type AssigneeType =
  | 'Security team'
  | 'Backend maintainer'
  | 'Frontend maintainer'
  | 'Docs team'
  | 'Triage volunteer'
  | 'Product / maintainer';

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export type ActionType = 'add_labels' | 'post_comment' | 'post_reproduction_request' | 'mark_duplicate';

export interface GithubLabel {
  name: string;
  color?: string;
}

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  user: { login: string } | null;
  labels: GithubLabel[];
  created_at: string;
  updated_at: string;
  comments: number;
  pull_request?: unknown;
}

export interface DuplicateMatch {
  issueNumber: number;
  title: string;
  confidence: number;
}

export interface TriageResult {
  category: IssueCategory;
  priority: IssuePriority;
  isSecurity: boolean;
  suggestedLabels: string[];
  maintainerResponse: string;
  reproductionRequest: string | null;
  duplicateOf: DuplicateMatch | null;
  suggestedAssigneeType: AssigneeType;
  rationale: string;
}

export interface TriageSuggestionRecord {
  id: string;
  repo_owner: string;
  repo_name: string;
  issue_number: number;
  issue_title: string;
  issue_url: string;
  issue_author: string | null;
  category: IssueCategory;
  priority: IssuePriority;
  is_security: boolean;
  suggested_labels: string[];
  maintainer_response: string;
  reproduction_request: string | null;
  duplicate_of_issue_number: number | null;
  duplicate_confidence: number | null;
  suggested_assignee_type: AssigneeType;
  rationale: string;
  status: SuggestionStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface ActionHistoryRecord {
  id: string;
  suggestion_id: string;
  repo_owner: string;
  repo_name: string;
  issue_number: number;
  action_type: ActionType;
  payload: Record<string, unknown>;
  dry_run: boolean;
  result: string;
  created_at: string;
}

export interface RepoRef {
  owner: string;
  repo: string;
}
