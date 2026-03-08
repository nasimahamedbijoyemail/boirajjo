
-- Fix: Prevent users from updating admin-listed books (USING also blocks admin rows)
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;
CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND is_admin_listing = false
  )
  WITH CHECK (is_admin_listing = false);

-- Fix: Remove self-insert from user_notifications, restrict to admins only
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.user_notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
