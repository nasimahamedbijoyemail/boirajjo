
-- EU Products table
CREATE TABLE public.eu_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'books',
  subcategory TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  condition TEXT NOT NULL DEFAULT 'good',
  photo_url TEXT,
  stock INTEGER NOT NULL DEFAULT 1,
  is_available BOOLEAN NOT NULL DEFAULT true,
  city TEXT,
  country TEXT DEFAULT 'EU',
  delivery_days_min INTEGER DEFAULT 2,
  delivery_days_max INTEGER DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EU Product Requests table
CREATE TABLE public.eu_product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author_name TEXT,
  description TEXT,
  preferred_city TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.eu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eu_product_requests ENABLE ROW LEVEL SECURITY;

-- EU Products: public read, admin write
CREATE POLICY "EU products viewable by everyone" ON public.eu_products
  FOR SELECT TO public USING (is_available = true);

CREATE POLICY "Admins can manage EU products" ON public.eu_products
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- EU Product Requests: users create/view own, admins manage all
CREATE POLICY "Users can create EU product requests" ON public.eu_product_requests
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own EU product requests" ON public.eu_product_requests
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all EU product requests" ON public.eu_product_requests
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at triggers
CREATE TRIGGER update_eu_products_updated_at BEFORE UPDATE ON public.eu_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eu_product_requests_updated_at BEFORE UPDATE ON public.eu_product_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
