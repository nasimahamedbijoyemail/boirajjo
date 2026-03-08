
-- 1. Add photo_url column to book_demands
ALTER TABLE public.book_demands ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Create a general-purpose uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS for uploads bucket - authenticated users can upload their own files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 4. Anyone can view uploaded files (public bucket)
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- 5. Users can delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
