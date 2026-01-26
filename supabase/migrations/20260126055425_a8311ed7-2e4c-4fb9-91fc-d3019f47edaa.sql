-- Create festival_banners table for image-only banners
CREATE TABLE public.festival_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT NOT NULL DEFAULT 'Festival Banner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.festival_banners ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for festival banners"
ON public.festival_banners
FOR SELECT
USING (true);

-- Admin policies
CREATE POLICY "Admin insert festival banners"
ON public.festival_banners
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin update festival banners"
ON public.festival_banners
FOR UPDATE
USING (true);

CREATE POLICY "Admin delete festival banners"
ON public.festival_banners
FOR DELETE
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_festival_banners_updated_at
BEFORE UPDATE ON public.festival_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();