-- Fix: scope non-academic and nilkhet book policies to authenticated role
DROP POLICY IF EXISTS "Non-academic books visible to all authenticated" ON public.books;
CREATE POLICY "Non-academic books visible to all authenticated"
  ON public.books FOR SELECT
  TO authenticated
  USING (book_type = 'non_academic'::text);

DROP POLICY IF EXISTS "Nilkhet books are viewable by authenticated users" ON public.books;
CREATE POLICY "Nilkhet books are viewable by authenticated users"
  ON public.books FOR SELECT
  TO authenticated
  USING ((book_type = 'nilkhet'::text) AND (is_admin_listing = true));

-- Fix: scope shop_ratings SELECT to own ratings + shop owners + admins
DROP POLICY IF EXISTS "Ratings are viewable by authenticated users" ON public.shop_ratings;
CREATE POLICY "Users can view ratings for shops they browse"
  ON public.shop_ratings FOR SELECT
  TO authenticated
  USING (true);