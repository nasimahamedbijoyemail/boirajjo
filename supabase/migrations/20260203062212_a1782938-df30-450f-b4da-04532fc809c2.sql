-- Add unique order number to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating order number
DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- Add category fields to books for non-academic categorization
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS subcategory_detail TEXT;

-- Create shops table for Nilkhet shops
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT,
  address TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating_average NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on shops
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- RLS policies for shops
CREATE POLICY "Shops are viewable by everyone" 
ON public.shops FOR SELECT 
USING (is_active = true);

CREATE POLICY "Shop owners can manage their shop" 
ON public.shops FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all shops" 
ON public.shops FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create shop_books table for shop inventory
CREATE TABLE IF NOT EXISTS public.shop_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price NUMERIC NOT NULL,
  condition book_condition DEFAULT 'good' NOT NULL,
  book_condition_type TEXT NOT NULL CHECK (book_condition_type IN ('old', 'new')),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  photo_url TEXT,
  stock INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on shop_books
ALTER TABLE public.shop_books ENABLE ROW LEVEL SECURITY;

-- RLS policies for shop_books
CREATE POLICY "Shop books are viewable by everyone" 
ON public.shop_books FOR SELECT 
USING (is_available = true);

CREATE POLICY "Shop owners can manage their books" 
ON public.shop_books FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all shop books" 
ON public.shop_books FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create shop_orders table for orders from shops
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  shop_id UUID REFERENCES public.shops(id) NOT NULL,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  shop_book_id UUID REFERENCES public.shop_books(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC NOT NULL,
  division_id UUID REFERENCES public.bd_divisions(id),
  district_id UUID REFERENCES public.bd_districts(id),
  thana_id UUID REFERENCES public.bd_thanas(id),
  detail_address TEXT,
  status order_status DEFAULT 'pending' NOT NULL,
  customer_notes TEXT,
  shop_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on shop_orders
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for shop_orders
CREATE POLICY "Users can view their own shop orders" 
ON public.shop_orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create shop orders" 
ON public.shop_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Shop owners can view and update their orders" 
ON public.shop_orders FOR ALL 
USING (shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all shop orders" 
ON public.shop_orders FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate shop order number
CREATE OR REPLACE FUNCTION public.generate_shop_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating shop order number
CREATE TRIGGER set_shop_order_number
  BEFORE INSERT ON public.shop_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_shop_order_number();

-- Create shop_ratings table
CREATE TABLE IF NOT EXISTS public.shop_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  shop_order_id UUID REFERENCES public.shop_orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(shop_id, user_id)
);

-- Enable RLS on shop_ratings
ALTER TABLE public.shop_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for shop_ratings
CREATE POLICY "Ratings are viewable by everyone" 
ON public.shop_ratings FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ratings" 
ON public.shop_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.shop_ratings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings" 
ON public.shop_ratings FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create contact_unlock_payments table for bKash payments
CREATE TABLE IF NOT EXISTS public.contact_unlock_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  book_id UUID REFERENCES public.books(id) NOT NULL,
  amount NUMERIC NOT NULL,
  bkash_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on contact_unlock_payments
ALTER TABLE public.contact_unlock_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_unlock_payments
CREATE POLICY "Users can view their own payments" 
ON public.contact_unlock_payments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" 
ON public.contact_unlock_payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments" 
ON public.contact_unlock_payments FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate transaction number
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transaction_number := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating transaction number
CREATE TRIGGER set_transaction_number
  BEFORE INSERT ON public.contact_unlock_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_transaction_number();

-- Add unique transaction number to book_demands
ALTER TABLE public.book_demands ADD COLUMN IF NOT EXISTS demand_number TEXT UNIQUE;

-- Create function to generate demand number
CREATE OR REPLACE FUNCTION public.generate_demand_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.demand_number := 'DMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating demand number
DROP TRIGGER IF EXISTS set_demand_number ON public.book_demands;
CREATE TRIGGER set_demand_number
  BEFORE INSERT ON public.book_demands
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_demand_number();

-- Create triggers for updated_at
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_books_updated_at
  BEFORE UPDATE ON public.shop_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_unlock_payments_updated_at
  BEFORE UPDATE ON public.contact_unlock_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update shop rating average
CREATE OR REPLACE FUNCTION public.update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.shops
  SET rating_average = (
    SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
    FROM public.shop_ratings
    WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
  ),
  rating_count = (
    SELECT COUNT(*)
    FROM public.shop_ratings
    WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
  )
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to update shop rating on rating changes
CREATE TRIGGER update_shop_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.shop_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shop_rating();