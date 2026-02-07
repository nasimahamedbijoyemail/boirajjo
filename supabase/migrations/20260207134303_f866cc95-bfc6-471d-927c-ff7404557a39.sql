-- Create user notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.user_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert notifications (for admin broadcasts)
CREATE POLICY "Service role can insert notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (true);

-- Create admin broadcast messages table
CREATE TABLE public.admin_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'all', 'institution', 'department', 'shop', 'user'
  target_institution_id UUID REFERENCES public.institutions(id),
  target_department_id UUID REFERENCES public.departments(id),
  target_academic_department_id UUID REFERENCES public.academic_departments(id),
  target_shop_id UUID REFERENCES public.shops(id),
  target_user_id UUID,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;

-- Only admins can view broadcasts
CREATE POLICY "Admins can view broadcasts"
ON public.admin_broadcasts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert broadcasts
CREATE POLICY "Admins can insert broadcasts"
ON public.admin_broadcasts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));