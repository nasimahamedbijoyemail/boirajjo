
CREATE OR REPLACE FUNCTION public.get_seller_contact(p_book_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_seller_id uuid;
  v_result jsonb;
  v_payment_enabled boolean;
BEGIN
  SELECT seller_id INTO v_seller_id FROM books WHERE id = p_book_id;
  IF v_seller_id IS NULL THEN RETURN NULL; END IF;

  -- Check if payment system is enabled
  SELECT (value)::boolean INTO v_payment_enabled 
  FROM app_settings WHERE key = 'payment_enabled';
  
  -- If payment is off, or user is seller, or admin, or has approved payment -> show contact
  IF v_payment_enabled IS NOT TRUE
     OR EXISTS(SELECT 1 FROM profiles WHERE id = v_seller_id AND user_id = auth.uid())
     OR has_role(auth.uid(), 'admin'::app_role)
     OR EXISTS(SELECT 1 FROM contact_unlock_payments WHERE book_id = p_book_id AND user_id = auth.uid() AND status = 'approved')
  THEN
    SELECT jsonb_build_object('name', p.name, 'phone_number', p.phone_number, 'whatsapp_number', p.whatsapp_number)
    INTO v_result FROM profiles p WHERE p.id = v_seller_id;
  ELSE
    SELECT jsonb_build_object('name', p.name, 'phone_number', null, 'whatsapp_number', null)
    INTO v_result FROM profiles p WHERE p.id = v_seller_id;
  END IF;

  RETURN v_result;
END;
$function$;
