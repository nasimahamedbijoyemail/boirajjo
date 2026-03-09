-- Create enum for shop types
CREATE TYPE public.shop_type AS ENUM ('bookstore', 'library', 'individual_seller');

-- Add shop_type column to shops table
ALTER TABLE public.shops ADD COLUMN shop_type public.shop_type NOT NULL DEFAULT 'individual_seller';

-- Add comment for clarity
COMMENT ON COLUMN public.shops.shop_type IS 'Type of shop: bookstore, library, or individual seller';