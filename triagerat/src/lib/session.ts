import { cookies } from 'next/headers';
import type { RepoRef } from './types';

const TOKEN_COOKIE = 'triagerat_gh_token';
const REPO_COOKIE = 'triagerat_repo';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 8, // 8 hours
};

/**
 * Stores the GitHub token + repo connection in httpOnly cookies for the
 * duration of the session. The token is never written to Supabase or
 * exposed to client-side JS.
 */
export function setConnection(token: string, ref: RepoRef) {
  const store = cookies();
  store.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
  store.set(REPO_COOKIE, JSON.stringify(ref), COOKIE_OPTIONS);
}

export function getConnection(): { token: string; ref: RepoRef } | null {
  const store = cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  const repoRaw = store.get(REPO_COOKIE)?.value;
  if (!token || !repoRaw) return null;

  try {
    const ref = JSON.parse(repoRaw) as RepoRef;
    if (!ref.owner || !ref.repo) return null;
    return { token, ref };
  } catch {
    return null;
  }
}

export function clearConnection() {
  const store = cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(REPO_COOKIE);
}
