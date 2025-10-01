-- Fix ambiguous column reference in toggle_review_like by fully qualifying columns
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
    from public.review_likes rl
    where rl.review_id = p_review_id
      and rl.user_id = auth.uid()
  ) then
    delete from public.review_likes rl
    where rl.review_id = p_review_id
      and rl.user_id = auth.uid();
  else
    insert into public.review_likes (review_id, user_id)
    values (p_review_id, auth.uid());
  end if;

  return query
  select
    p_review_id as review_id,
    (select count(*) from public.review_likes rl where rl.review_id = p_review_id) as like_count,
    exists(
      select 1 from public.review_likes rl2
      where rl2.review_id = p_review_id and rl2.user_id = auth.uid()
    ) as is_liked_by_me;
end;
$$;

