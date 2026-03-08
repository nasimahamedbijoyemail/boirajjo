
-- Fix 1: Profiles PII exposure - drop overly broad policy if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles are viewable by authenticated users' AND tablename = 'profiles') THEN
    DROP POLICY "Profiles are viewable by authenticated users" ON public.profiles;
  END IF;
END $$;

-- Fix 2: Prevent non-admins from setting is_admin_listing=true on INSERT
DROP POLICY IF EXISTS "Users can insert their own books" ON public.books;
CREATE POLICY "Users can insert their own books"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND is_admin_listing = false
  );

-- Fix 3: Prevent non-admins from setting is_admin_listing=true on UPDATE
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;
CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (is_admin_listing = false);
