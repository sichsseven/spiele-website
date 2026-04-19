-- Nekromant Idle: nur Spalte unlocked_skills (wenn user_progress SCHON existiert)
--
-- Fehler "relation user_progress does not exist"?
-- → Stattdessen EINMAL scripts/supabase-nekromant-user-progress-full.sql ausführen.

alter table public.user_progress
  add column if not exists unlocked_skills jsonb not null default '["center_node"]'::jsonb;
