
-- App settings table for global config like payment toggle
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT 'false'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings are viewable by everyone"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can manage settings"
ON public.app_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default payment setting (off)
INSERT INTO public.app_settings (key, value) VALUES ('payment_enabled', 'false'::jsonb);
