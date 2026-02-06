-- BergenBudget initial schema
-- Run this against your Supabase PostgreSQL database

-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Accounts table
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('brukskonto', 'sparekonto', 'kredittkort', 'bsu')),
  balance decimal(12,2) not null default 0,
  color text not null default '#3b82f6',
  icon text not null default '💳',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id text not null,
  amount decimal(12,2) not null,
  type text not null check (type in ('inntekt', 'utgift', 'overføring')),
  description text not null,
  date date not null,
  tags text[] default '{}',
  notes text,
  receipt_url text,
  is_recurring_instance boolean default false,
  recurring_id uuid references public.recurring_transactions(id),
  created_at timestamptz not null default now()
);

-- Recurring transactions table
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id text not null,
  amount decimal(12,2) not null,
  type text not null check (type in ('inntekt', 'utgift')),
  description text not null,
  frequency text not null check (frequency in ('daglig', 'ukentlig', 'månedlig', 'årlig')),
  day_of_month integer,
  next_date date not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Budgets table
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  amount decimal(12,2) not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  created_at timestamptz not null default now(),
  unique(user_id, category_id, month, year)
);

-- Row Level Security
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.budgets enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

create policy "Users can view own recurrings" on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own recurrings" on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own recurrings" on public.recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete own recurrings" on public.recurring_transactions for delete using (auth.uid() = user_id);

create policy "Users can view own budgets" on public.budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.budgets for delete using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_accounts_updated_at
  before update on public.accounts
  for each row execute function update_updated_at_column();

-- Indexes
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_account on public.transactions(account_id);
create index if not exists idx_budgets_user_period on public.budgets(user_id, year, month);
