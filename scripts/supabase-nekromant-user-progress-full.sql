-- PIXELZONE — Nekromant Idle: komplettes user_progress-Setup
-- EINMAL im Supabase SQL Editor ausführen (wenn user_progress noch nicht existiert
-- oder Spalten fehlen). Anschließend sind Cloud-Saves für das Idle-Spiel möglich.

-- 1) Tabelle anlegen (minimal, falls noch nicht vorhanden)
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bones bigint not null default 0,
  grave_goods bigint not null default 0,
  world_essence bigint not null default 0,
  dimensions_completed int not null default 0,
  dimension_multiplier numeric not null default 1,
  lifetime_bones_this_run bigint not null default 0,
  upgrades jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Spalten nachziehen (falls Tabelle schon älter war)
alter table public.user_progress
  add column if not exists expedition_state jsonb not null default '{}'::jsonb;

alter table public.user_progress
  add column if not exists artifacts_owned jsonb not null default '{}'::jsonb;

alter table public.user_progress
  add column if not exists unlocked_skills jsonb not null default '["center_node"]'::jsonb;

-- 3) Index
create index if not exists user_progress_updated_at_idx on public.user_progress (updated_at desc);

-- 4) Row Level Security
alter table public.user_progress enable row level security;

-- 5) Policies (nur anlegen, wenn noch nicht vorhanden)
drop policy if exists "user_progress_select_own" on public.user_progress;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "user_progress_update_own" on public.user_progress;
drop policy if exists "user_progress_delete_own" on public.user_progress;

create policy "user_progress_select_own"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "user_progress_insert_own"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "user_progress_update_own"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_progress_delete_own"
  on public.user_progress for delete
  using (auth.uid() = user_id);
