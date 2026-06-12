import type { GithubIssue, RepoRef } from './types';

const GITHUB_API = 'https://api.github.com';

export class GithubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'GithubApiError';
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * Parses a GitHub repo URL or "owner/repo" shorthand into a RepoRef.
 */
export function parseRepoUrl(input: string): RepoRef {
  const trimmed = input.trim().replace(/\/$/, '');
  const shorthand = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shorthand) {
    return { owner: shorthand[1], repo: shorthand[2].replace(/\.git$/, '') };
  }

  const urlMatch = trimmed.match(/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?$/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  throw new Error('Kunne ikke tolke repo. Bruk "owner/repo" eller en full GitHub URL.');
}

/**
 * Verifies the token can access the given repo (used by the connect flow).
 */
export async function verifyRepoAccess(token: string, ref: RepoRef): Promise<{ fullName: string; private: boolean }> {
  const res = await fetch(`${GITHUB_API}/repos/${ref.owner}/${ref.repo}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new GithubApiError(`Fant ikke repo eller mangler tilgang (${res.status})`, res.status);
  }

  const data = await res.json();
  return { fullName: data.full_name, private: data.private };
}

/**
 * Fetches open issues (excluding pull requests) for a repo, paginated.
 */
export async function fetchOpenIssues(token: string, ref: RepoRef, maxPages = 5): Promise<GithubIssue[]> {
  const issues: GithubIssue[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const url = `${GITHUB_API}/repos/${ref.owner}/${ref.repo}/issues?state=open&per_page=50&page=${page}`;
    const res = await fetch(url, { headers: authHeaders(token), cache: 'no-store' });

    if (!res.ok) {
      throw new GithubApiError(`Kunne ikke hente issues (${res.status})`, res.status);
    }

    const batch = (await res.json()) as GithubIssue[];
    const onlyIssues = batch.filter((item) => !item.pull_request);
    issues.push(...onlyIssues);

    if (batch.length < 50) break;
  }

  return issues;
}

/**
 * Adds labels to an issue. Creates the labels implicitly if they don't exist
 * (GitHub auto-creates labels referenced via this endpoint with a default color).
 */
export async function addLabelsToIssue(token: string, ref: RepoRef, issueNumber: number, labels: string[]) {
  const res = await fetch(`${GITHUB_API}/repos/${ref.owner}/${ref.repo}/issues/${issueNumber}/labels`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ labels }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new GithubApiError(`Kunne ikke legge til labels (${res.status}): ${body}`, res.status);
  }

  return res.json();
}

/**
 * Posts a comment on an issue. This is a write to a public-facing thread, so
 * callers must enforce the "no public security info" safety rule before
 * invoking this for security-classified issues.
 */
export async function postIssueComment(token: string, ref: RepoRef, issueNumber: number, body: string) {
  const res = await fetch(`${GITHUB_API}/repos/${ref.owner}/${ref.repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new GithubApiError(`Kunne ikke poste kommentar (${res.status}): ${text}`, res.status);
  }

  return res.json();
}
