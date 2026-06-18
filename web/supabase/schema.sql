-- ============================================================================
--  Tet Studio — Supabase schema
--  Paste this whole file into the Supabase SQL Editor and hit "Run".
--  Safe to run more than once (idempotent).
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          text primary key,                 -- Clerk user id (the JWT "sub")
  email       text,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user',      -- 'user' | 'admin'
  plan        text not null default 'free',      -- 'free' | 'pro'
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.prompts (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,                     -- Clerk user id of the author
  author_name text,
  medium      text not null,                     -- photo | video | music | art | poem
  seed        text not null,
  body        text not null,
  details     jsonb not null default '[]'::jsonb,
  is_public   boolean not null default false,
  likes       integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists prompts_user_id_idx on public.prompts (user_id);
create index if not exists prompts_public_idx
  on public.prompts (is_public, created_at desc);

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Clerk is configured as a Supabase third-party auth provider, so the signed-in
-- user's Clerk id is available as auth.jwt() ->> 'sub'.

alter table public.profiles enable row level security;
alter table public.prompts  enable row level security;

-- profiles: a user can only see and edit their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.jwt() ->> 'sub') = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.jwt() ->> 'sub') = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.jwt() ->> 'sub') = id);

-- prompts: anyone can read public prompts; authors manage their own.
drop policy if exists "prompts_select_public_or_own" on public.prompts;
create policy "prompts_select_public_or_own" on public.prompts
  for select using (
    is_public or (select auth.jwt() ->> 'sub') = user_id
  );

drop policy if exists "prompts_insert_own" on public.prompts;
create policy "prompts_insert_own" on public.prompts
  for insert with check ((select auth.jwt() ->> 'sub') = user_id);

drop policy if exists "prompts_update_own" on public.prompts;
create policy "prompts_update_own" on public.prompts
  for update using ((select auth.jwt() ->> 'sub') = user_id);

drop policy if exists "prompts_delete_own" on public.prompts;
create policy "prompts_delete_own" on public.prompts
  for delete using ((select auth.jwt() ->> 'sub') = user_id);

-- ── Likes: safe public increment via SECURITY DEFINER ───────────────────────
-- Lets any signed-in user like a *public* prompt without granting broad update.
create or replace function public.increment_prompt_likes(prompt_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.prompts
     set likes = likes + 1
   where id = prompt_id and is_public;
$$;

grant execute on function public.increment_prompt_likes(uuid)
  to anon, authenticated;

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Stream inserts/updates/deletes on prompts to the community feed.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'prompts'
  ) then
    alter publication supabase_realtime add table public.prompts;
  end if;
end $$;

-- ============================================================================
--  Done. Next: enable Clerk as a third-party auth provider in
--  Supabase → Authentication → Sign In / Providers → Clerk (paste your
--  Clerk domain). See web/README.md for the 4-minute walkthrough.
-- ============================================================================
