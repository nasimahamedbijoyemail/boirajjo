-- Create enum for institution types
CREATE TYPE public.institution_type AS ENUM ('university', 'college', 'school');

-- Create enum for book conditions
CREATE TYPE public.book_condition AS ENUM ('new', 'good', 'worn');

-- Create enum for book status
CREATE TYPE public.book_status AS ENUM ('available', 'sold');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type institution_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table (for universities)
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  institution_type institution_type,
  institution_id UUID REFERENCES public.institutions(id),
  subcategory TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  institution_type institution_type NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) NOT NULL,
  subcategory TEXT,
  condition book_condition NOT NULL DEFAULT 'good',
  price DECIMAL(10,2) NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status book_status NOT NULL DEFAULT 'available',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Institutions policies (public read, admin write)
CREATE POLICY "Institutions are viewable by everyone"
  ON public.institutions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert institutions"
  ON public.institutions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update institutions"
  ON public.institutions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete institutions"
  ON public.institutions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Departments policies (public read, admin write)
CREATE POLICY "Departments are viewable by everyone"
  ON public.departments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert departments"
  ON public.departments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update departments"
  ON public.departments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete departments"
  ON public.departments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Books policies
CREATE POLICY "Books are viewable by users from same institution"
  ON public.books FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own books"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own books"
  ON public.books FOR DELETE
  TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all books"
  ON public.books FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert preloaded institutions
-- Universities
INSERT INTO public.institutions (name, type) VALUES
  ('University of Dhaka', 'university'),
  ('Jahangirnagar University', 'university'),
  ('Rajshahi University', 'university'),
  ('Chittagong University', 'university'),
  ('Khulna University', 'university'),
  ('Jagannath University', 'university'),
  ('BUET', 'university'),
  ('KUET', 'university'),
  ('RUET', 'university'),
  ('CUET', 'university'),
  ('North South University', 'university'),
  ('BRAC University', 'university'),
  ('East West University', 'university'),
  ('AIUB', 'university'),
  ('Daffodil International University', 'university');

-- Colleges
INSERT INTO public.institutions (name, type) VALUES
  ('Dhaka College', 'college'),
  ('Eden Mohila College', 'college'),
  ('Notre Dame College', 'college'),
  ('Holy Cross College', 'college'),
  ('Govt. Science College', 'college'),
  ('Viqarunnisa Noon College', 'college');

-- Schools
INSERT INTO public.institutions (name, type) VALUES
  ('Ideal School & College', 'school'),
  ('Viqarunnisa Noon School', 'school'),
  ('Monipur High School', 'school'),
  ('St. Gregory''s School', 'school'),
  ('Scholastica', 'school');

-- Insert sample departments for universities
INSERT INTO public.departments (institution_id, name)
SELECT id, 'Computer Science & Engineering'
FROM public.institutions WHERE type = 'university';

INSERT INTO public.departments (institution_id, name)
SELECT id, 'Electrical & Electronic Engineering'
FROM public.institutions WHERE type = 'university';

INSERT INTO public.departments (institution_id, name)
SELECT id, 'Business Administration'
FROM public.institutions WHERE type = 'university';

INSERT INTO public.departments (institution_id, name)
SELECT id, 'English'
FROM public.institutions WHERE type = 'university';

INSERT INTO public.departments (institution_id, name)
SELECT id, 'Economics'
FROM public.institutions WHERE type = 'university';