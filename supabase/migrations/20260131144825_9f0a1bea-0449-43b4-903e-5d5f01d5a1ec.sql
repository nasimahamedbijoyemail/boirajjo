-- Create department book requests table
CREATE TABLE public.department_book_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id),
  academic_department_id UUID REFERENCES public.academic_departments(id),
  institution_id UUID NOT NULL REFERENCES public.institutions(id),
  title TEXT NOT NULL,
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.department_book_requests ENABLE ROW LEVEL SECURITY;

-- Users from same department can view requests
CREATE POLICY "Users can view requests from same department"
ON public.department_book_requests
FOR SELECT
USING (
  department_id IN (SELECT department_id FROM profiles WHERE user_id = auth.uid())
  OR academic_department_id IN (SELECT academic_department_id FROM profiles WHERE user_id = auth.uid())
);

-- Users can create their own requests
CREATE POLICY "Users can create their own requests"
ON public.department_book_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY "Users can update their own requests"
ON public.department_book_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own requests
CREATE POLICY "Users can delete their own requests"
ON public.department_book_requests
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage all department requests"
ON public.department_book_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_department_book_requests_updated_at
BEFORE UPDATE ON public.department_book_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();