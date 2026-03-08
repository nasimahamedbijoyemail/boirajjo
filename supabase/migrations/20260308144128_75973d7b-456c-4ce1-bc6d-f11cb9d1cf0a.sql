
-- 1. Create safe profiles view (bypasses base table RLS, exposes only non-sensitive columns)
CREATE VIEW public.profiles_safe AS
SELECT id, user_id, name, institution_id, institution_type, department_id, academic_department_id, subcategory, created_at, updated_at
FROM public.profiles;

-- 2. Restrict base profiles table (was previously USING (true) for all authenticated users)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Create RPC for seller contact info (only reveals phone after payment unlock, own book, or admin)
CREATE OR REPLACE FUNCTION public.get_seller_contact(p_book_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id uuid;
  v_result jsonb;
BEGIN
  SELECT seller_id INTO v_seller_id FROM books WHERE id = p_book_id;
  IF v_seller_id IS NULL THEN RETURN NULL; END IF;

  IF EXISTS(SELECT 1 FROM profiles WHERE id = v_seller_id AND user_id = auth.uid())
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
$$;

-- 4. Fix admin_notifications overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;
CREATE POLICY "Only admins can insert notifications" ON public.admin_notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
