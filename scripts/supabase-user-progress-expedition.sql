-- Nekromant Idle: Expedition + Artefakte in user_progress
-- Nach dem Basis-Skript (supabase-user-progress.sql) ausführen.

alter table public.user_progress
  add column if not exists expedition_state jsonb not null default '{}'::jsonb;

alter table public.user_progress
  add column if not exists artifacts_owned jsonb not null default '{}'::jsonb;
