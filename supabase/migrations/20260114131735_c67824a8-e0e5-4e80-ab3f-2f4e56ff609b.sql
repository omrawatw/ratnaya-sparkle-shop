-- Create delivery_settings table
CREATE TABLE public.delivery_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  charge numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT NULL,
  is_free boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for delivery settings"
ON public.delivery_settings
FOR SELECT
USING (true);

-- Admin can insert
CREATE POLICY "Admin insert delivery settings"
ON public.delivery_settings
FOR INSERT
WITH CHECK (true);

-- Admin can update
CREATE POLICY "Admin update delivery settings"
ON public.delivery_settings
FOR UPDATE
USING (true);

-- Admin can delete
CREATE POLICY "Admin delete delivery settings"
ON public.delivery_settings
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_settings_updated_at
BEFORE UPDATE ON public.delivery_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default delivery options
INSERT INTO public.delivery_settings (name, charge, min_order_amount, is_free, is_active, display_order)
VALUES 
  ('Free Delivery', 0, 2000, true, true, 0),
  ('Standard Delivery', 99, NULL, false, true, 1),
  ('Express Delivery', 199, NULL, false, true, 2);