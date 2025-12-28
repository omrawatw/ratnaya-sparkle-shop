-- Add RLS policy for admin_users (only accessible via edge function)
CREATE POLICY "Admin users not directly accessible" ON public.admin_users FOR SELECT USING (false);

-- Add policies for orders and order_items to be readable (for admin viewing)
CREATE POLICY "Orders are readable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Order items are readable" ON public.order_items FOR SELECT USING (true);

-- Allow updating orders (for status changes)
CREATE POLICY "Orders can be updated" ON public.orders FOR UPDATE USING (true);

-- Allow products to be inserted, updated, deleted (for admin)
CREATE POLICY "Products can be inserted" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products can be updated" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products can be deleted" ON public.products FOR DELETE USING (true);