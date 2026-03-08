
-- Drop the security definer view (flagged by linter)
DROP VIEW IF EXISTS public.profiles_safe;

-- Restore profiles SELECT for all authenticated users (needed for FK joins across the app)
-- The sensitive contact info is protected by the get_seller_contact RPC function
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
