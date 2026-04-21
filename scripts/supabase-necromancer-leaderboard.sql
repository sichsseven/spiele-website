-- Nekromant Idle: lifetime_clicks + öffentliche Rangliste (RPC)
-- Im Supabase SQL Editor ausführen.

alter table public.user_progress
  add column if not exists lifetime_clicks bigint not null default 0;

create or replace function public.get_necromancer_leaderboard(p_category text)
returns table(
  rank bigint,
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
      p.benutzername as bn,
      up.bones as b,
      up.lifetime_clicks as lc,
      up.user_id as uid
    from public.profiles p
    inner join public.user_progress up on up.user_id = p.user_id
    where p.benutzername is not null
      and length(trim(p.benutzername)) > 0
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
  select rk, bn, b, lc, uid
  from ranked
  where rk <= 50
  order by rk;
$$;

revoke all on function public.get_necromancer_leaderboard(text) from public;
grant execute on function public.get_necromancer_leaderboard(text) to anon, authenticated;
