
-- 1. Fix profiles: restrict SELECT to own profile + admins (protects phone numbers)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix shops: require authentication to view
DROP POLICY IF EXISTS "Shops are viewable by everyone" ON public.shops;

CREATE POLICY "Shops are viewable by authenticated users"
  ON public.shops FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 3. Fix shop_ratings: require authentication
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.shop_ratings;

CREATE POLICY "Ratings are viewable by authenticated users"
  ON public.shop_ratings FOR SELECT
  TO authenticated
  USING (true);
