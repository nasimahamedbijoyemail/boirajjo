
-- 1. Create a security definer function to safely expose non-sensitive settings
CREATE OR REPLACE FUNCTION public.get_public_setting(setting_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  allowed_keys text[] := ARRAY[
    'payment_enabled',
    'promo_banner_enabled',
    'promo_banner_image_url',
    'promo_banner_link'
  ];
BEGIN
  -- Only return whitelisted keys
  IF NOT (setting_key = ANY(allowed_keys)) THEN
    RETURN NULL;
  END IF;

  SELECT value INTO result
  FROM public.app_settings
  WHERE key = setting_key;

  RETURN result;
END;
$$;

-- 2. Restrict direct SELECT to admins only
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.app_settings;

CREATE POLICY "Settings viewable by admins only"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
