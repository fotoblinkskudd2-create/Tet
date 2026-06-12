import { Octokit } from "@octokit/rest";

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  user: string | null;
  labels: string[];
  created_at: string;
  updated_at: string;
}

export function getOctokit(token: string): Octokit {
  if (!token) {
    throw new Error("A GitHub token is required.");
  }
  return new Octokit({ auth: token });
}

/** Parse a repo URL or "owner/repo" string into its parts. */
export function parseRepoFullName(input: string): { owner: string; repo: string } {
  const trimmed = input.trim().replace(/\/$/, "");
  const match = trimmed.match(/(?:github\.com[/:])?([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) {
    throw new Error(`Could not parse repository from "${input}". Expected "owner/repo" or a GitHub URL.`);
  }
  return { owner: match[1], repo: match[2] };
}

/** Fetch all open issues (excluding pull requests) for a repo. */
export async function listOpenIssues(owner: string, repo: string, token: string): Promise<GithubIssue[]> {
  const octokit = getOctokit(token);
  const issues: GithubIssue[] = [];

  for await (const response of octokit.paginate.iterator(octokit.issues.listForRepo, {
    owner,
    repo,
    state: "open",
    per_page: 100,
  })) {
    for (const item of response.data) {
      if (item.pull_request) continue;
      issues.push({
        id: item.id,
        number: item.number,
        title: item.title,
        body: item.body ?? null,
        html_url: item.html_url,
        state: item.state,
        user: item.user?.login ?? null,
        labels: item.labels.map((label) => (typeof label === "string" ? label : label.name ?? "")).filter(Boolean),
        created_at: item.created_at,
        updated_at: item.updated_at,
      });
    }
  }

  return issues;
}

export async function addLabels(
  owner: string,
  repo: string,
  issueNumber: number,
  labels: string[],
  token: string
): Promise<void> {
  if (labels.length === 0) return;
  const octokit = getOctokit(token);
  await octokit.issues.addLabels({ owner, repo, issue_number: issueNumber, labels });
}

export async function createComment(
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  token: string
): Promise<{ id: number; html_url: string }> {
  const octokit = getOctokit(token);
  const response = await octokit.issues.createComment({ owner, repo, issue_number: issueNumber, body });
  return { id: response.data.id, html_url: response.data.html_url };
}

/**
 * Close an issue. This must only ever be called after explicit maintainer approval -
 * never automatically as part of triage/sync.
 */
export async function closeIssue(owner: string, repo: string, issueNumber: number, token: string): Promise<void> {
  const octokit = getOctokit(token);
  await octokit.issues.update({ owner, repo, issue_number: issueNumber, state: "closed" });
}
