-- Add delivery time estimate column to delivery_settings
ALTER TABLE public.delivery_settings 
ADD COLUMN estimated_time text DEFAULT '3-5 business days';