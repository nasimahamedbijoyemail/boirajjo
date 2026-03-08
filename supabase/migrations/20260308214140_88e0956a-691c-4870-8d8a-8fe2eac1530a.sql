
-- 1. Fix shop_ratings: restrict SELECT to rating owner, shop owner, and admins
DROP POLICY IF EXISTS "Authenticated users can view ratings" ON public.shop_ratings;

CREATE POLICY "Users can view their own ratings"
  ON public.shop_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Shop owners can view their shop ratings"
  ON public.shop_ratings FOR SELECT
  TO authenticated
  USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

-- 2. Fix has_role enumeration: revoke EXECUTE from public and authenticated roles
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- 3. Fix uploads bucket: scope INSERT to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;

CREATE POLICY "Authenticated users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
