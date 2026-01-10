-- Create table for product images
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Product images are publicly readable
CREATE POLICY "Product images are publicly readable"
ON public.product_images
FOR SELECT
USING (true);

-- Product images can be inserted (admin)
CREATE POLICY "Product images can be inserted"
ON public.product_images
FOR INSERT
WITH CHECK (true);

-- Product images can be updated
CREATE POLICY "Product images can be updated"
ON public.product_images
FOR UPDATE
USING (true);

-- Product images can be deleted
CREATE POLICY "Product images can be deleted"
ON public.product_images
FOR DELETE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);