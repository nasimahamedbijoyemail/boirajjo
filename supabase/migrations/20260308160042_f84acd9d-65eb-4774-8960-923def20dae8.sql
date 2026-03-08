-- Remove redundant duplicate UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update their own profile deletion status" ON public.profiles;