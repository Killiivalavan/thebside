-- 1. Enable RLS on the reviews table if it's not already enabled.
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing SELECT policy to replace it.
DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are public or owned by the user" ON public.reviews;


-- 3. Create the new SELECT policy.
CREATE POLICY "Reviews are public or owned by the user"
ON public.reviews
FOR SELECT
USING (is_private = false OR auth.uid() = user_id);

-- 4. Re-affirm INSERT policy for security.
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Re-affirm UPDATE policy for security.
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Re-affirm DELETE policy for security.
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);