-- Create table for offer banners
CREATE TABLE public.offer_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  background_color TEXT DEFAULT '#D4AF37',
  text_color TEXT DEFAULT '#1A1A2E',
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offer_banners ENABLE ROW LEVEL SECURITY;

-- Banners are publicly readable
CREATE POLICY "Offer banners are publicly readable"
ON public.offer_banners
FOR SELECT
USING (true);

-- Banners can be inserted (admin)
CREATE POLICY "Offer banners can be inserted"
ON public.offer_banners
FOR INSERT
WITH CHECK (true);

-- Banners can be updated
CREATE POLICY "Offer banners can be updated"
ON public.offer_banners
FOR UPDATE
USING (true);

-- Banners can be deleted
CREATE POLICY "Offer banners can be deleted"
ON public.offer_banners
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_offer_banners_updated_at
BEFORE UPDATE ON public.offer_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();