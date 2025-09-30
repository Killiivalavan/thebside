DROP FUNCTION IF EXISTS public.get_review_threads_for_item(text);

CREATE OR REPLACE FUNCTION public.get_review_threads_for_item(p_item_id text)
RETURNS TABLE(id uuid, parent_id uuid, created_at timestamp with time zone, review_text text, rating integer, user_id uuid, username text, avatar_url text, is_relisten boolean, is_private boolean)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE review_tree AS (
    -- Base case: select top-level reviews for the given item
    SELECT
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
    FROM
      public.reviews r
      JOIN public.users u ON r.user_id = u.id
    WHERE
      r.item_id = p_item_id

    UNION ALL

    -- Recursive step: select replies to the reviews we've already found
    SELECT
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
    FROM
      public.reviews r
      JOIN public.users u ON r.user_id = u.id
      JOIN review_tree rt ON r.parent_id = rt.id
  )
  SELECT
    rt.id,
    rt.parent_id,
    rt.created_at,
    rt.review_text,
    rt.rating,
    rt.user_id,
    rt.username,
    rt.avatar_url,
    rt.is_relisten,
    rt.is_private
  FROM review_tree rt;
END;
$function$;