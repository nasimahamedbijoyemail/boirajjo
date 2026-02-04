-- Add refund request fields to contact_unlock_payments
ALTER TABLE public.contact_unlock_payments 
ADD COLUMN IF NOT EXISTS refund_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS refund_approved boolean,
ADD COLUMN IF NOT EXISTS refund_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS refund_notes text;

-- Add category and subcategory to books table for non-academic books (to store nilkhet-style categories)
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS non_academic_category text,
ADD COLUMN IF NOT EXISTS non_academic_subcategory text;