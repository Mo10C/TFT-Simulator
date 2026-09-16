-- =========================================================
-- ほげ走 - Supabase setup
-- Supabase Dashboard > SQL Editor で、このファイル全体を1回実行してください。
-- その後 Authentication 設定で Anonymous Sign-Ins を有効にします。
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score integer,
  coins integer,
  status text not null default 'active' check (status in ('active', 'finished'))
);

create index if not exists game_runs_user_score_idx
  on public.game_runs(user_id, score desc)
  where status = 'finished';

alter table public.profiles enable row level security;
alter table public.game_runs enable row level security;

-- 再実行しやすいように既存ポリシーを削除。
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- game_runs はクライアントから直接書き込ませず、下のRPC経由だけにする。
revoke all on table public.game_runs from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

create or replace function public.start_game()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.game_runs (user_id)
  values (v_user_id)
  returning id into v_run_id;

  return v_run_id;
end;
$$;

create or replace function public.finish_game(
  p_run_id uuid,
  p_score integer,
  p_coins integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_started_at timestamptz;
  v_owner uuid;
  v_status text;
  v_elapsed numeric;
  v_max_score integer;
  v_max_coins integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_score < 0 or p_coins < 0 then
    raise exception 'Invalid score';
  end if;

  select started_at, user_id, status
    into v_started_at, v_owner, v_status
  from public.game_runs
  where id = p_run_id
  for update;

  if not found then
    raise exception 'Run not found';
  end if;

  if v_owner <> v_user_id then
    raise exception 'Not your run';
  end if;

  if v_status <> 'active' then
    raise exception 'Run already finished';
  end if;

  v_elapsed := greatest(extract(epoch from (now() - v_started_at)), 1);

  -- ブラウザゲームなので完全なチート防止ではありません。
  -- ただし、明らかに不可能な瞬間スコアだけサーバー時間で弾きます。
  v_max_score := floor(v_elapsed * 100 + 1500);
  v_max_coins := floor(v_elapsed * 15 + 40);

  if p_score > v_max_score then
    raise exception 'Score rejected';
  end if;

  if p_coins > v_max_coins then
    raise exception 'Coin count rejected';
  end if;

  update public.game_runs
  set
    finished_at = now(),
    score = p_score,
    coins = p_coins,
    status = 'finished'
  where id = p_run_id;
end;
$$;

create or replace function public.get_leaderboard(p_limit integer default 30)
returns table (
  rank bigint,
  user_id uuid,
  username text,
  best_score integer,
  best_coins integer,
  total_runs bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with player_best as (
    select
      p.id as user_id,
      p.username,
      max(r.score)::integer as best_score,
      max(r.coins)::integer as best_coins,
      count(*)::bigint as total_runs
    from public.profiles p
    join public.game_runs r on r.user_id = p.id
    where r.status = 'finished'
    group by p.id, p.username
  ), ranked as (
    select
      row_number() over (order by best_score desc, total_runs asc, username asc)::bigint as rank,
      user_id,
      username,
      best_score,
      best_coins,
      total_runs
    from player_best
  )
  select rank, user_id, username, best_score, best_coins, total_runs
  from ranked
  order by rank
  limit greatest(1, least(coalesce(p_limit, 30), 100));
$$;

revoke all on function public.start_game() from public;
revoke all on function public.finish_game(uuid, integer, integer) from public;
revoke all on function public.get_leaderboard(integer) from public;

grant execute on function public.start_game() to authenticated;
grant execute on function public.finish_game(uuid, integer, integer) to authenticated;
grant execute on function public.get_leaderboard(integer) to authenticated;
