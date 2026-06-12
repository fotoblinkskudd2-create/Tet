-- TriageRat schema
-- Run this in the Supabase SQL editor (or via the CLI) for your project.

create extension if not exists "pgcrypto";

-- Per-repo configuration (GitHub token / Anthropic key can also come from env vars)
create table if not exists repo_configs (
  id uuid primary key default gen_random_uuid(),
  repo_full_name text not null unique,
  github_token text,
  anthropic_api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Synced GitHub issues
create table if not exists issues (
  id bigint primary key, -- GitHub issue id
  repo_full_name text not null,
  number int not null,
  title text not null,
  body text,
  author text,
  state text not null default 'open',
  html_url text not null,
  github_labels jsonb not null default '[]',
  github_updated_at timestamptz,
  github_created_at timestamptz,
  synced_at timestamptz not null default now(),
  unique (repo_full_name, number)
);

create index if not exists issues_repo_idx on issues (repo_full_name);

-- AI-generated triage suggestions, one current row per issue
create table if not exists triage_suggestions (
  id uuid primary key default gen_random_uuid(),
  issue_id bigint not null references issues (id) on delete cascade,
  category text not null check (category in (
    'Bug', 'Feature', 'Question', 'Duplicate', 'Invalid',
    'Needs reproduction', 'Security concern', 'Documentation'
  )),
  priority text not null check (priority in ('P0', 'P1', 'P2', 'P3')),
  is_security boolean not null default false,
  suggested_labels jsonb not null default '[]',
  maintainer_response text,
  reproduction_request text,
  duplicate_of int,
  duplicate_confidence numeric,
  suggested_assignee_type text,
  rationale text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'applied')),
  actions jsonb not null default '{}',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  unique (issue_id)
);

create index if not exists triage_suggestions_status_idx on triage_suggestions (status);

-- Audit log of every applied (or attempted) GitHub write
create table if not exists action_history (
  id uuid primary key default gen_random_uuid(),
  issue_id bigint references issues (id) on delete cascade,
  suggestion_id uuid references triage_suggestions (id) on delete set null,
  action_type text not null check (action_type in (
    'add_labels', 'post_comment', 'post_reproduction_request', 'close_issue', 'reject'
  )),
  payload jsonb,
  result text not null check (result in ('success', 'error', 'dry_run')),
  error_message text,
  performed_at timestamptz not null default now(),
  performed_by text not null default 'maintainer'
);

create index if not exists action_history_issue_idx on action_history (issue_id);
