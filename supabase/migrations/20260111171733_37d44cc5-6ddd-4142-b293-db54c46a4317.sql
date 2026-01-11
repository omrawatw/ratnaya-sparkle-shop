-- Add public read access policy for offer_banners so banners display on homepage
CREATE POLICY "Anyone can view active offer banners"
ON public.offer_banners
FOR SELECT
USING (true);