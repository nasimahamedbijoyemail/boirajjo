-- 1. Add book_type column to books table for Academic/Non-Academic/Nilkhet
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS book_type text NOT NULL DEFAULT 'academic' CHECK (book_type IN ('academic', 'non_academic', 'nilkhet'));

-- 2. Add is_admin_listing column for Nilkhet books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_admin_listing boolean NOT NULL DEFAULT false;

-- 3. Create BD locations tables (divisions, districts, thanas, wards)
CREATE TABLE public.bd_divisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  bn_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.bd_districts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division_id uuid NOT NULL REFERENCES public.bd_divisions(id) ON DELETE CASCADE,
  name text NOT NULL,
  bn_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.bd_thanas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.bd_districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  bn_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.bd_wards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thana_id uuid NOT NULL REFERENCES public.bd_thanas(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Create book_demands table for book request feature
CREATE TYPE public.demand_status AS ENUM ('requested', 'processing', 'out_for_delivery', 'delivered', 'cancelled');

CREATE TABLE public.book_demands (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_name text NOT NULL,
  author_name text,
  division_id uuid REFERENCES public.bd_divisions(id),
  district_id uuid REFERENCES public.bd_districts(id),
  thana_id uuid REFERENCES public.bd_thanas(id),
  ward_id uuid REFERENCES public.bd_wards(id),
  detail_address text,
  status demand_status NOT NULL DEFAULT 'requested',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Create orders table for Nilkhet book orders
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled');

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  total_price numeric NOT NULL,
  division_id uuid REFERENCES public.bd_divisions(id),
  district_id uuid REFERENCES public.bd_districts(id),
  thana_id uuid REFERENCES public.bd_thanas(id),
  ward_id uuid REFERENCES public.bd_wards(id),
  detail_address text,
  status order_status NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 6. Create admin_notifications table for tracking
CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('signup', 'book_demand', 'order', 'new_listing', 'book_sold')),
  title text NOT NULL,
  message text NOT NULL,
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.bd_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_thanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for BD location tables (readable by everyone)
CREATE POLICY "Divisions are viewable by everyone" ON public.bd_divisions FOR SELECT USING (true);
CREATE POLICY "Districts are viewable by everyone" ON public.bd_districts FOR SELECT USING (true);
CREATE POLICY "Thanas are viewable by everyone" ON public.bd_thanas FOR SELECT USING (true);
CREATE POLICY "Wards are viewable by everyone" ON public.bd_wards FOR SELECT USING (true);

CREATE POLICY "Admins can manage divisions" ON public.bd_divisions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage districts" ON public.bd_districts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage thanas" ON public.bd_thanas FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage wards" ON public.bd_wards FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for book_demands
CREATE POLICY "Users can view their own demands" ON public.book_demands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create demands" ON public.book_demands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all demands" ON public.book_demands FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update demands" ON public.book_demands FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can view notifications" ON public.admin_notifications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);

-- Allow Nilkhet books to be viewed by everyone
CREATE POLICY "Nilkhet books are viewable by authenticated users" ON public.books FOR SELECT USING (book_type = 'nilkhet' AND is_admin_listing = true);

-- Allow non-academic books to be viewable by everyone in same institution OR globally
CREATE POLICY "Non-academic books visible to all authenticated" ON public.books FOR SELECT USING (book_type = 'non_academic');

-- Add triggers for updated_at
CREATE TRIGGER update_book_demands_updated_at
BEFORE UPDATE ON public.book_demands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_book_demands_user_id ON public.book_demands(user_id);
CREATE INDEX idx_book_demands_status ON public.book_demands(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_book_id ON public.orders(book_id);
CREATE INDEX idx_books_book_type ON public.books(book_type);
CREATE INDEX idx_bd_districts_division ON public.bd_districts(division_id);
CREATE INDEX idx_bd_thanas_district ON public.bd_thanas(district_id);
CREATE INDEX idx_bd_wards_thana ON public.bd_wards(thana_id);