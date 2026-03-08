
-- Create a safe RPC to get shop public info without exposing phone numbers
CREATE OR REPLACE FUNCTION public.get_shop_public_info(p_shop_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid := auth.uid();
BEGIN
  -- If user is shop owner or admin, show full info
  IF EXISTS(SELECT 1 FROM shops WHERE id = p_shop_id AND user_id = v_user_id)
     OR has_role(v_user_id, 'admin'::app_role)
     OR EXISTS(SELECT 1 FROM shop_orders WHERE shop_id = p_shop_id AND user_id = v_user_id AND status IN ('confirmed', 'processing', 'out_for_delivery', 'delivered'))
  THEN
    SELECT jsonb_build_object(
      'id', s.id, 'name', s.name, 'description', s.description,
      'phone_number', s.phone_number, 'whatsapp_number', s.whatsapp_number,
      'address', s.address, 'logo_url', s.logo_url,
      'is_verified', s.is_verified, 'rating_average', s.rating_average, 'rating_count', s.rating_count
    ) INTO v_result FROM shops s WHERE s.id = p_shop_id AND s.is_active = true;
  ELSE
    -- Hide contact details for non-related users
    SELECT jsonb_build_object(
      'id', s.id, 'name', s.name, 'description', s.description,
      'phone_number', null, 'whatsapp_number', null,
      'address', s.address, 'logo_url', s.logo_url,
      'is_verified', s.is_verified, 'rating_average', s.rating_average, 'rating_count', s.rating_count
    ) INTO v_result FROM shops s WHERE s.id = p_shop_id AND s.is_active = true;
  END IF;

  RETURN v_result;
END;
$$;
