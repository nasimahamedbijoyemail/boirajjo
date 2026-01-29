-- 1. Add 'national_university' to institution_type enum
ALTER TYPE public.institution_type ADD VALUE IF NOT EXISTS 'national_university';

-- 2. Add whatsapp_number and department_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- 3. Add department_id to books as well (for filtering)
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- 4. Create a table for universal departments (academic programs)
CREATE TABLE IF NOT EXISTS public.academic_departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on academic_departments
ALTER TABLE public.academic_departments ENABLE ROW LEVEL SECURITY;

-- Everyone can view academic departments
CREATE POLICY "Academic departments are viewable by everyone"
ON public.academic_departments
FOR SELECT
USING (true);

-- Admins can manage academic departments
CREATE POLICY "Admins can manage academic departments"
ON public.academic_departments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Update profiles to reference academic_department
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS academic_department_id uuid REFERENCES public.academic_departments(id);

-- 6. Update books to reference academic_department
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS academic_department_id uuid REFERENCES public.academic_departments(id);