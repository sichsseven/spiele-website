-- Spielstand-Version (Migration / Balancing, z. B. Welten-Essenz-Reset v5)
-- In Supabase SQL Editor ausführen, falls die Spalte noch fehlt.

alter table public.user_progress
  add column if not exists save_version int not null default 1;

alter table public.user_progress
  add column if not exists last_saved_time timestamptz not null default now();

alter table public.user_progress
  add column if not exists soulstones bigint not null default 0;

alter table public.user_progress
  add column if not exists necro_base_stats jsonb not null default '{}'::jsonb;
