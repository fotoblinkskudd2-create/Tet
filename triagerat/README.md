# TriageRat

An AI-powered GitHub issue triage dashboard. TriageRat fetches open issues from a
GitHub repository, asks Claude to classify each one (category, priority, suggested
labels, draft responses, duplicate detection, suggested assignee type), and lets a
maintainer review and approve actions before anything is written back to GitHub.

## Safety model

- **Sync is read-only.** `/api/sync` fetches issues from GitHub and stores AI
  triage suggestions in Supabase. It never adds labels, posts comments, or closes
  issues.
- **Nothing is written to GitHub without explicit approval.** Every label addition,
  comment, or close happens through `/api/approve`, which supports a `dryRun`
  preview mode.
- **Issues can never be closed automatically.** Closing requires the maintainer to
  tick "Close this issue" on a specific suggestion and click Approve.
- **Security concerns stay private.** If a suggestion is flagged `is_security`,
  TriageRat refuses to post a maintainer response or reproduction-request comment
  publicly (the API returns a 403 if you try). Labels can still be applied, and the
  AI rationale stays internal to the dashboard.
- **Full audit trail.** Every applied (or attempted) GitHub write is recorded in
  `action_history`, visible on the History page.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres) for issues, suggestions, and action history
- GitHub REST API via Octokit
- Anthropic Claude API (`@anthropic-ai/sdk`) with structured JSON outputs for
  classification

## Setup

1. Create a Supabase project and run `src/supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`
   - `GITHUB_TOKEN`, `GITHUB_REPO` (or configure these later via the Settings page)
   - `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`, defaults to
     `claude-opus-4-8`)
3. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`, set your repo in **Settings** (or rely on env
   vars), then go to **Inbox** and click **Sync issues**.

## Workflow

1. **Sync** - fetches open issues and generates triage suggestions (dry-run, no
   GitHub writes).
2. **Inbox** - browse issues with AI-suggested category, priority, labels, and
   duplicate detection.
3. **Issue detail** - review/edit the drafted maintainer response and
   reproduction request, choose which actions to apply, preview them (dry-run),
   then **Approve & apply to GitHub** or **Reject**.
4. **Bulk approve** - select multiple pending suggestions and apply the default
   action set (add labels + post maintainer response, skipping public comments for
   security-flagged issues) to all of them at once.
5. **History** - full audit log of every action TriageRat has applied.
