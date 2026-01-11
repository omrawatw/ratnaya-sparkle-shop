-- Drop restrictive policies and create proper permissive ones for offer_banners
DROP POLICY IF EXISTS "Anyone can view active offer banners" ON public.offer_banners;
DROP POLICY IF EXISTS "Offer banners are publicly readable" ON public.offer_banners;
DROP POLICY IF EXISTS "Offer banners can be deleted" ON public.offer_banners;
DROP POLICY IF EXISTS "Offer banners can be inserted" ON public.offer_banners;
DROP POLICY IF EXISTS "Offer banners can be updated" ON public.offer_banners;

-- Create proper PERMISSIVE policies
CREATE POLICY "Public read access for offer banners"
ON public.offer_banners
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin insert offer banners"
ON public.offer_banners
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admin update offer banners"
ON public.offer_banners
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Admin delete offer banners"
ON public.offer_banners
FOR DELETE
TO public
USING (true);