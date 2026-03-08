-- Drop the conflicting restrictive deletion policy
DROP POLICY IF EXISTS "Users can update their own profile deletion status" ON public.profiles;

-- The existing "Users can update their own profile" policy with USING (auth.uid() = user_id)
-- is sufficient. Add a permissive policy for deletion requests that also uses user_id.
CREATE POLICY "Users can update their own profile deletion status"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);