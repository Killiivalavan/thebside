-- Provide global like counts without exposing liker identities
-- 1) Create SECURITY DEFINER helper to count likes across all users
drop function if exists public.get_review_like_count(uuid);
create or replace function public.get_review_like_count(p_review_id uuid)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.review_likes where review_id = p_review_id;
$$;

-- 2) Update threads RPC to use the helper while remaining security invoker
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
    -- Global like count via SECURITY DEFINER helper
    public.get_review_like_count(rt.id) as like_count,
    -- User-scoped like state respects RLS (invoker)
    exists(
      select 1
      from public.review_likes rl2
      where rl2.review_id = rt.id and rl2.user_id = auth.uid()
    ) as is_liked_by_me
  from review_tree rt;
end;
$function$;


