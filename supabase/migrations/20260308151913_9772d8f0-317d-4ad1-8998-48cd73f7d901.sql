
-- Add promo banner settings
INSERT INTO public.app_settings (key, value) VALUES 
  ('promo_banner_enabled', 'false'::jsonb),
  ('promo_banner_image_url', '""'::jsonb),
  ('promo_banner_link', '""'::jsonb);

-- Create storage bucket for promo images
INSERT INTO storage.buckets (id, name, public) VALUES ('promo', 'promo', true);

-- Allow anyone to view promo images
CREATE POLICY "Promo images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'promo');

-- Only admins can upload/delete promo images
CREATE POLICY "Admins can manage promo images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'promo' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'promo' AND public.has_role(auth.uid(), 'admin'::app_role));
