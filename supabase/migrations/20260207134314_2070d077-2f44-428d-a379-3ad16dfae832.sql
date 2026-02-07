-- Fix overly permissive RLS policies
-- Drop the permissive insert policy
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.user_notifications;

-- Create proper insert policy - only allow inserts where user_id matches or admin
CREATE POLICY "Admins can insert notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);