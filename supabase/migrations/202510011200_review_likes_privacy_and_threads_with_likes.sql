-- 0) Safety: required extension (usually already present)
create extension if not exists pgcrypto;

-- 1) Enforce privacy-preserving RLS on review_likes
alter table public.review_likes enable row level security;

-- Remove any broad/public SELECT policies
drop policy if exists "Users can view all review likes" on public.review_likes;

-- Users can only SELECT their own like rows (prevents enumerating other users)
drop policy if exists "Users can view own review likes only" on public.review_likes;
create policy "Users can view own review likes only"
on public.review_likes
for select
to authenticated
using (user_id = auth.uid());

-- Insert/Delete limited to the acting user
drop policy if exists "Users can insert their own likes" on public.review_likes;
create policy "Users can insert their own likes"
on public.review_likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own likes" on public.review_likes;
create policy "Users can delete their own likes"
on public.review_likes
for delete
to authenticated
using (auth.uid() = user_id);

-- 2) Helpful indexes (composite PK likely exists already)
create index if not exists idx_review_likes_review_id on public.review_likes (review_id);
create index if not exists idx_review_likes_user_id on public.review_likes (user_id);

-- 3) Atomic toggle RPC (returns updated count and liked state)
drop function if exists public.toggle_review_like(uuid);
create or replace function public.toggle_review_like(p_review_id uuid)
returns table (review_id uuid, like_count bigint, is_liked_by_me boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.review_likes
    where review_id = p_review_id
      and user_id = auth.uid()
  ) then
    delete from public.review_likes
    where review_id = p_review_id
      and user_id = auth.uid();
  else
    insert into public.review_likes (review_id, user_id)
    values (p_review_id, auth.uid());
  end if;

  return query
  select
    p_review_id as review_id,
    (select count(*) from public.review_likes where review_id = p_review_id) as like_count,
    exists(
      select 1 from public.review_likes
      where review_id = p_review_id and user_id = auth.uid()
    ) as is_liked_by_me;
end;
$$;

-- 4) Extend threads RPC to expose only count + caller's like state
drop function if exists public.get_review_threads_for_item(text);
create or replace function public.get_review_threads_for_item(p_item_id text)
returns table(
  id uuid,
  parent_id uuid,
  created_at timestamp with time zone,
  review_text text,
  rating integer,
  user_id uuid,
  username text,
  avatar_url text,
  is_relisten boolean,
  is_private boolean,
  like_count bigint,
  is_liked_by_me boolean
)
language plpgsql
security definer
set search_path = public
as $function$
begin
  return query
  with recursive review_tree as (
    -- Top-level reviews for the given item
    select
      r.id,
      r.parent_id,
      r.created_at,
      r.review_text,
      r.rating,
      r.user_id,
      u.username,
      u.avatar_url,
      r.is_relisten,
      r.is_private
    from public.reviews r
    join public.users u on u.id = r.user_id
    where r.item_id = p_item_id

    union all

    -- Replies to the reviews we've already found
    select
      r.id,
      r.parent_id,
      r.created_at,
      r.review_text,
      r.rating,
      r.user_id,
      u.username,
      u.avatar_url,
      r.is_relisten,
      r.is_private
    from public.reviews r
    join public.users u on u.id = r.user_id
    join review_tree rt on r.parent_id = rt.id
  )
  select
    rt.id,
    rt.parent_id,
    rt.created_at,
    rt.review_text,
    rt.rating,
    rt.user_id,
    rt.username,
    rt.avatar_url,
    rt.is_relisten,
    rt.is_private,
    -- Only expose aggregated counts + caller's liked state
    (select count(*) from public.review_likes rl where rl.review_id = rt.id) as like_count,
    exists(
      select 1
      from public.review_likes rl2
      where rl2.review_id = rt.id and rl2.user_id = auth.uid()
    ) as is_liked_by_me
  from review_tree rt;
end;
$function$;


