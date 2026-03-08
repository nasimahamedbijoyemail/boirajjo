-- Fix: Replace overly permissive ALL policy on shop_orders for shop owners
-- with separate, narrowly scoped SELECT and UPDATE policies

DROP POLICY IF EXISTS "Shop owners can view and update their orders" ON public.shop_orders;

-- Shop owners can VIEW orders for their shop
CREATE POLICY "Shop owners can view their shop orders"
ON public.shop_orders FOR SELECT
TO authenticated
USING (
  shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid())
);

-- Shop owners can UPDATE only their shop's orders (not INSERT/DELETE)
CREATE POLICY "Shop owners can update their shop orders"
ON public.shop_orders FOR UPDATE
TO authenticated
USING (
  shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid())
)
WITH CHECK (
  shop_id IN (SELECT id FROM public.shops WHERE user_id = auth.uid())
);