-- ═══════════════════════════════════════════════════════════════════════════
-- Nekromant Idle — Rangliste (Cache-Tabelle + Trigger)
-- Im Supabase SQL Editor EINMAL vollständig ausführen.
--
-- Problem: RLS auf profiles / user_progress verhindert zuverlässigen Zugriff auf
-- fremde Zeilen in Views/RPCs. Lösung: öffentliche Tabelle necromancer_lb_cache
-- (nur user_id, Name, bones, lifetime_clicks) — gefüllt per SECURITY DEFINER-Trigger
-- bei jedem Save. Die RPC liest nur diese Tabelle (SELECT für alle erlaubt).
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.user_progress
  add column if not exists lifetime_clicks bigint not null default 0;

-- Alte Varianten entfernen
drop function if exists public.get_necromancer_leaderboard(text);
drop view if exists public.v_necro_lb_full cascade;
drop view if exists public.v_necro_lb_stats cascade;

-- Cache: keine sensiblen JSON-Spalten
create table if not exists public.necromancer_lb_cache (
  user_id uuid primary key references auth.users (id) on delete cascade,
  benutzername text not null,
  bones bigint not null default 0,
  lifetime_clicks bigint not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists necromancer_lb_cache_score_bones_idx
  on public.necromancer_lb_cache (bones desc);
create index if not exists necromancer_lb_cache_score_clicks_idx
  on public.necromancer_lb_cache (lifetime_clicks desc);

alter table public.necromancer_lb_cache enable row level security;

drop policy if exists "necromancer_lb_cache_read_all" on public.necromancer_lb_cache;
create policy "necromancer_lb_cache_read_all"
  on public.necromancer_lb_cache
  for select
  using (true);

-- Nur System/Trigger schreiben — Clients nicht
revoke insert, update, delete on public.necromancer_lb_cache from public, anon, authenticated;
grant select on public.necromancer_lb_cache to anon, authenticated;

-- Zentrale Sync-Funktion (RLS würde sonst fremde/alle Zeilen blockieren)
create or replace function public.sync_necromancer_lb_cache_for_user(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  b bigint;
  lc bigint;
begin
  -- Als Tabellenbesitzer (postgres) greift RLS hier nicht; kein SET row_security nötig
  -- (SET LOCAL row_security = off schlägt auf manchen Rollen fehl und bricht Sync + Trigger.)
  select trim(p.benutzername)
    into uname
  from public.profiles p
  where p.user_id = p_uid;

  if uname is null or length(trim(uname)) = 0 then
    delete from public.necromancer_lb_cache where user_id = p_uid;
    return;
  end if;

  if not exists (select 1 from public.user_progress up where up.user_id = p_uid) then
    delete from public.necromancer_lb_cache where user_id = p_uid;
    return;
  end if;

  select up.bones, coalesce(up.lifetime_clicks, 0)::bigint
    into b, lc
  from public.user_progress up
  where up.user_id = p_uid;

  insert into public.necromancer_lb_cache (user_id, benutzername, bones, lifetime_clicks, updated_at)
  values (p_uid, uname, coalesce(b, 0), coalesce(lc, 0), now())
  on conflict (user_id) do update set
    benutzername = excluded.benutzername,
    bones = excluded.bones,
    lifetime_clicks = excluded.lifetime_clicks,
    updated_at = now();
end;
$$;

alter function public.sync_necromancer_lb_cache_for_user(uuid) owner to postgres;

-- Client: Eintrag für den aktuellen User nachziehen (Tab „Rangliste“)
create or replace function public.refresh_necromancer_lb_cache_self()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  perform public.sync_necromancer_lb_cache_for_user(auth.uid());
end;
$$;

alter function public.refresh_necromancer_lb_cache_self() owner to postgres;

revoke all on function public.refresh_necromancer_lb_cache_self() from public;
grant execute on function public.refresh_necromancer_lb_cache_self() to authenticated;

-- Trigger: Spielstand gespeichert / geändert
create or replace function public.trg_user_progress_sync_lb_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_necromancer_lb_cache_for_user(new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_user_progress_sync_lb on public.user_progress;
create trigger trg_user_progress_sync_lb
  after insert or update of bones, lifetime_clicks
  on public.user_progress
  for each row
  execute procedure public.trg_user_progress_sync_lb_cache();

-- Trigger: Benutzername geändert
create or replace function public.trg_profiles_sync_lb_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_necromancer_lb_cache_for_user(new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_profiles_sync_lb on public.profiles;
create trigger trg_profiles_sync_lb
  after insert or update of benutzername
  on public.profiles
  for each row
  execute procedure public.trg_profiles_sync_lb_cache();

-- user_progress gelöscht → Cache-Eintrag weg
create or replace function public.trg_user_progress_delete_lb_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.necromancer_lb_cache where user_id = old.user_id;
  return old;
end;
$$;

drop trigger if exists trg_user_progress_delete_lb on public.user_progress;
create trigger trg_user_progress_delete_lb
  after delete on public.user_progress
  for each row
  execute procedure public.trg_user_progress_delete_lb_cache();

-- Rangliste: nur Cache lesen (kein Join auf user_progress in der RPC)
create or replace function public.get_necromancer_leaderboard(p_category text)
returns table(
  lb_rank bigint,
  benutzername text,
  bones bigint,
  lifetime_clicks bigint,
  user_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      c.benutzername as bn,
      c.bones as b,
      c.lifetime_clicks as lc,
      c.user_id as uid
    from public.necromancer_lb_cache c
  ),
  scored as (
    select
      bn,
      b,
      lc,
      uid,
      case
        when lower(trim(p_category)) = 'clicks' then lc
        else b
      end as score
    from base
  ),
  ranked as (
    select
      bn,
      b,
      lc,
      uid,
      row_number() over (order by score desc)::bigint as rk
    from scored
  )
  select
    ranked.rk,
    ranked.bn,
    ranked.b,
    ranked.lc,
    ranked.uid
  from ranked
  where ranked.rk <= 50
  order by ranked.rk;
$$;

alter function public.get_necromancer_leaderboard(text) owner to postgres;

revoke all on function public.get_necromancer_leaderboard(text) from public;
grant execute on function public.get_necromancer_leaderboard(text) to anon, authenticated;

-- Bestehende Spieler: Cache über dieselbe Sync-Logik füllen (umgeht RLS-Probleme beim direkten INSERT)
do $$
declare
  r record;
begin
  for r in
    select p.user_id
    from public.profiles p
    inner join public.user_progress up on up.user_id = p.user_id
    where p.benutzername is not null
      and length(trim(p.benutzername)) > 0
  loop
    perform public.sync_necromancer_lb_cache_for_user(r.user_id);
  end loop;
end $$;
