-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'jewelry',
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);

-- Orders can be inserted by anyone (for checkout)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Order items can be inserted by anyone
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin (password: admin123 - should be changed)
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', 'admin123');

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, image_url, category, stock, featured) VALUES
('Royal Diamond Necklace', 'Exquisite 18K gold necklace with brilliant cut diamonds', 125000.00, 150000.00, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', 'necklaces', 5, true),
('Emerald Drop Earrings', 'Stunning emerald earrings set in white gold', 45000.00, 55000.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', 'earrings', 10, true),
('Pearl Bracelet', 'Classic freshwater pearl bracelet with gold clasp', 18000.00, 22000.00, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 'bracelets', 15, true),
('Sapphire Ring', 'Beautiful blue sapphire ring with diamond halo', 78000.00, 95000.00, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', 'rings', 8, true),
('Gold Temple Necklace', 'Traditional temple jewelry necklace in 22K gold', 95000.00, NULL, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', 'necklaces', 3, false),
('Diamond Studs', 'Classic diamond stud earrings in platinum', 35000.00, 42000.00, 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500', 'earrings', 20, false),
('Ruby Pendant', 'Elegant ruby pendant with rose gold chain', 28000.00, NULL, 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500', 'pendants', 12, false),
('Kundan Bangles Set', 'Traditional kundan work bangles set of 4', 65000.00, 75000.00, 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=500', 'bangles', 6, true);