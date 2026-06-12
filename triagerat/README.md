# TriageRat

TriageRat is a GitHub issue triage dashboard. It fetches open issues from a
repo, suggests a classification, priority, labels, maintainer response,
reproduction request, duplicate match and assignee type for each issue, and
lets a maintainer review and approve those suggestions — with a dry-run mode
that previews everything before anything is written back to GitHub.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for the dashboard UI
- **Supabase** (Postgres) for storing suggestions and action history
- **GitHub REST API** for fetching issues and writing labels/comments
- **LLM API** (Anthropic) for classification, with a built-in heuristic
  fallback so the app works even without an LLM key

## Setup

```bash
cd triagerat
npm install
cp .env.example .env.local
```

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. (Optional) Set `ANTHROPIC_API_KEY` to enable LLM-based triage. Without it,
   TriageRat uses a keyword/rule-based heuristic classifier — the rest of the
   app (dashboard, dry-run, approval, history) works the same either way.
4. Run the dev server:

```bash
npm run dev
```

5. Open http://localhost:3000, and in the **Connect to GitHub repo** form
   enter:
   - A repo, e.g. `owner/repo` or `https://github.com/owner/repo`
   - A GitHub personal access token with `repo` scope (or `public_repo` for
     public repos). The token is stored only in an httpOnly session cookie —
     it is never written to Supabase or sent to the LLM.

## How it works

### 1. Inbox (`/`)
Fetches open issues from the connected repo. Select one or more issues and
click **Kjør triage** to classify them.

### 2. Triage engine (`src/lib/triage.ts`)
For each issue, TriageRat:
- Classifies it into one of: **Bug, Feature, Question, Duplicate, Invalid,
  Needs reproduction, Security concern, Documentation**
- Assigns a priority: **P0 critical, P1 important, P2 normal, P3 low**
- Generates: suggested labels, a draft maintainer response, a reproduction
  request (if applicable), a possible duplicate match (against other open
  issues), and a suggested assignee type (e.g. "Security team", "Docs team")

If `ANTHROPIC_API_KEY` is set, this runs through the LLM
(`src/lib/llm.ts`); otherwise it falls back to
`src/lib/heuristics.ts`, a deterministic keyword-based classifier.

Results are stored as **pending** suggestions in Supabase
(`triage_suggestions`).

### 3. Suggested actions (`/suggestions`)
Lists pending/approved/applied/rejected suggestions. For selected
suggestions you can:
- Toggle **Dry-run** (default ON) — previews exactly what would happen,
  writes nothing to GitHub
- Choose to apply suggested **labels**
- Choose a **comment** to post: maintainer response, reproduction request, or
  a duplicate-flagging comment
- **Bulk approve** multiple issues at once
- **Reject** suggestions you disagree with

Turning off dry-run and clicking "Godkjenn og utfør" is the only way actions
are written to GitHub (label additions, comments).

### 4. History (`/history`)
A log of every action taken (dry-run previews and live writes), with
timestamps and results.

## Safety guarantees

- **No automatic closing.** There is no "close issue" action anywhere in the
  code — `action_history.action_type` only allows `add_labels`,
  `post_comment`, `post_reproduction_request`, `mark_duplicate`. Closing is
  always left to a human maintainer.
- **Dry-run by default.** The approve endpoint defaults `dryRun` to `true`
  even if the field is omitted from the request.
- **No public posting of security details.** Issues classified as "Security
  concern" have their generated text sanitized to remove exploit-style
  details (`src/lib/triage.ts`). Additionally, posting *any* comment on a
  security-classified issue requires an explicit `confirmPublicSecurityPost`
  confirmation in the UI — without it, the comment action is blocked and
  logged as `blocked` in history.
- **Token handling.** The GitHub token is kept only in an httpOnly cookie for
  the session; it's never persisted to Supabase or sent to the LLM provider.

## Project structure

```
src/
  app/
    page.tsx                 Inbox
    suggestions/page.tsx      Suggested actions + bulk approve
    history/page.tsx          History
    api/
      connect/route.ts         connect/disconnect to a repo
      connection/route.ts       current connection status
      issues/route.ts           fetch open issues
      triage/route.ts           run triage on selected issues
      suggestions/route.ts      list stored suggestions
      actions/approve/route.ts  dry-run / live approval + GitHub writes
      actions/reject/route.ts   reject suggestions
      history/route.ts          action history
  components/
    ConnectionBar.tsx, Navbar.tsx, Badges.tsx
  lib/
    github.ts      GitHub REST API client
    llm.ts          LLM-based classifier (Anthropic)
    heuristics.ts   Rule-based fallback classifier
    triage.ts       Combines LLM/heuristics + safety sanitization
    supabase.ts     Supabase server client
    session.ts      httpOnly cookie session (token + repo)
    types.ts        Shared types
supabase/schema.sql Database schema
```
