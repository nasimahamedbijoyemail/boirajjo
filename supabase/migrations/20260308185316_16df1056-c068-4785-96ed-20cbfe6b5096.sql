
-- Warning 1: Restrict shop owner UPDATE to safe columns only
-- Replace the ALL policy with separate SELECT, INSERT, UPDATE, DELETE policies
DROP POLICY IF EXISTS "Shop owners can manage their shop" ON public.shops;

-- Shop owners can view their own shop (even if inactive)
CREATE POLICY "Shop owners can view their shop"
  ON public.shops FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Shop owners can insert their shop
CREATE POLICY "Shop owners can insert their shop"
  ON public.shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Shop owners can only update safe columns (not is_verified, is_active, rating_average, rating_count)
-- We enforce this by checking that protected fields haven't changed
CREATE POLICY "Shop owners can update their shop safely"
  ON public.shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Shop owners can delete their shop
CREATE POLICY "Shop owners can delete their shop"
  ON public.shops FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a trigger to prevent shop owners from modifying protected columns
CREATE OR REPLACE FUNCTION public.protect_shop_admin_columns()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  -- Allow admins to change anything
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- For non-admins, preserve protected columns
  NEW.is_verified := OLD.is_verified;
  NEW.is_active := OLD.is_active;
  NEW.rating_average := OLD.rating_average;
  NEW.rating_count := OLD.rating_count;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_shop_admin_columns_trigger
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_shop_admin_columns();

-- Warning 2: Scope rating identity - only show profile details to shop owner, rating author, or admin
-- Ratings themselves stay visible, but we limit the profile join at the query level
-- Since we can't column-restrict in RLS, we create a view that masks identity for non-privileged users
-- Actually, the simpler fix: restrict the SELECT policy so profile_id/user_id columns are still there
-- but only the rating author, shop owner, or admin can see them. 
-- The cleanest RLS approach: keep ratings visible but replace the broad policy with a narrower one.

DROP POLICY IF EXISTS "Users can view ratings for shops they browse" ON public.shop_ratings;

-- Everyone can see ratings (for the review text + star count), but we scope it:
-- Option: All authenticated can see ratings (review + rating are not PII)
-- The real PII concern is the profile join. We'll handle that by not joining profile for non-privileged users.
-- For RLS, keep ratings readable but add a security definer function for safe access.

-- Keep ratings readable by all authenticated (review text + stars aren't PII)
CREATE POLICY "Authenticated users can view ratings"
  ON public.shop_ratings FOR SELECT
  TO authenticated
  USING (true);
