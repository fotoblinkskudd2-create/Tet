-- TriageRat schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI) for your project.

create extension if not exists "pgcrypto";

create table if not exists triage_suggestions (
  id uuid primary key default gen_random_uuid(),
  repo_owner text not null,
  repo_name text not null,
  issue_number integer not null,
  issue_title text not null,
  issue_url text not null,
  issue_author text,
  category text not null,
  priority text not null,
  is_security boolean not null default false,
  suggested_labels jsonb not null default '[]'::jsonb,
  maintainer_response text not null default '',
  reproduction_request text,
  duplicate_of_issue_number integer,
  duplicate_confidence numeric,
  suggested_assignee_type text not null,
  rationale text not null default '',
  engine text not null default 'heuristic',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'applied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (repo_owner, repo_name, issue_number)
);

create index if not exists idx_triage_suggestions_repo
  on triage_suggestions (repo_owner, repo_name, status);

create table if not exists action_history (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid references triage_suggestions (id) on delete set null,
  repo_owner text not null,
  repo_name text not null,
  issue_number integer not null,
  action_type text not null check (action_type in ('add_labels', 'post_comment', 'post_reproduction_request', 'mark_duplicate')),
  payload jsonb not null default '{}'::jsonb,
  dry_run boolean not null default true,
  result text not null default 'ok',
  created_at timestamptz not null default now()
);

create index if not exists idx_action_history_repo
  on action_history (repo_owner, repo_name, created_at desc);

-- Safety note: there is intentionally NO action_type for closing issues.
-- Closing issues automatically is out of scope for TriageRat by design.
