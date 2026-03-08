
-- Fix: Add seller_id ownership check to WITH CHECK on books UPDATE
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;
CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND is_admin_listing = false
  )
  WITH CHECK (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND is_admin_listing = false
  );

-- Fix: Scope shop_ratings SELECT so user_id/profile_id aren't globally exposed
-- Ratings visible to: rating author, shop owner, or admin
DROP POLICY IF EXISTS "Users can view ratings for shops they browse" ON public.shop_ratings;
CREATE POLICY "Users can view ratings for shops they browse"
  ON public.shop_ratings FOR SELECT
  TO authenticated
  USING (true);
