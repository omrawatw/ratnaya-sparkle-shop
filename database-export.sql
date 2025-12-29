-- =============================================
-- DATABASE SCHEMA EXPORT
-- Jewelry E-commerce Database
-- =============================================

-- 1. Create ENUM for user roles (if implementing role-based access)
-- CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Products Table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'jewelry',
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Orders Table
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
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Order Items Table
CREATE TABLE public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Profiles Table (for authenticated users)
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Admin Users Table
CREATE TABLE public.admin_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
    RETURN new;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for new user signup (attach to auth.users)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Products Policies (publicly readable, admin can modify)
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products can be inserted" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products can be updated" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products can be deleted" ON public.products FOR DELETE USING (true);

-- Orders Policies
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are readable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders can be updated" ON public.orders FOR UPDATE USING (true);

-- Order Items Policies
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items are readable" ON public.order_items FOR SELECT USING (true);

-- Profiles Policies (users can only access their own profile)
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Admin Users Policies (not directly accessible)
CREATE POLICY "Admin users not directly accessible" ON public.admin_users FOR SELECT USING (false);

-- =============================================
-- DATA EXPORT
-- =============================================

-- Products Data
INSERT INTO public.products (id, name, description, price, original_price, image_url, category, stock, featured) VALUES
('f65d083d-256a-45cb-b165-fc85a4b03bf9', 'Royal Diamond Necklace', 'Exquisite 18K gold necklace with brilliant cut diamonds', 125000.00, 150000.00, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', 'necklaces', 5, true),
('54519326-4d65-42ae-8f3c-75774e76a981', 'Emerald Drop Earrings', 'Stunning emerald earrings set in white gold', 45000.00, 55000.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', 'earrings', 10, true),
('8705b2fe-5d7f-4be3-86d9-6decbf357862', 'Pearl Bracelet', 'Classic freshwater pearl bracelet with gold clasp', 18000.00, 22000.00, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 'bracelets', 15, true),
('f4797b2f-1141-4697-ad74-c4aeeec9815e', 'Sapphire Ring', 'Beautiful blue sapphire ring with diamond halo', 78000.00, 95000.00, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', 'rings', 8, true),
('d028a0dc-e2c4-46f6-a4de-efff74d1fd18', 'Gold Temple Necklace', 'Traditional temple jewelry necklace in 22K gold', 95000.00, NULL, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', 'necklaces', 3, false),
('127d02f5-a5c8-47b5-bcec-c641071e47a4', 'Diamond Studs', 'Classic diamond stud earrings in platinum', 35000.00, 42000.00, 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=500', 'earrings', 20, false),
('49bd6eea-c813-45d1-9172-aa675a177611', 'Ruby Pendant', 'Elegant ruby pendant with rose gold chain', 28000.00, NULL, 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500', 'pendants', 12, false),
('f40b59fd-33e2-4fad-8b70-eecf9a9bac59', 'Kundan Bangles Set', 'Traditional kundan work bangles set of 4', 65000.00, 75000.00, 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=500', 'bangles', 6, true);

-- Orders Data
INSERT INTO public.orders (id, customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, payment_method, status, total_amount) VALUES
('89274af1-22de-4624-822e-0906ecfdeb5e', 'OM rawat', 'omrawat5999@okhdfcbank', '06397031644', 'Bagi', 'Dehradun', 'Uttarakhand', '248001', 'upi', 'pending', 95000.00),
('2390458b-f468-4f69-8d53-3ca6e399020f', 'OM rawat', 'omrawat5999@okhdfcbank', '06397031644', 'Bagi', 'Dehradun', 'Uttarakhand', '248001', 'card', 'pending', 375000.00),
('0eb6913c-ba73-42b8-862f-2d9af2d7eb0f', 'OM rawat', 'omrawat5999@okhdfcbank', '06397031644', 'Bagi', 'Dehradun', 'Uttarakhand', '248001', 'cod', 'pending', 125000.00),
('9fd082aa-64e8-4cef-b5f4-9a7fcd450d9b', 'Dev Rajput', 'dev39481@gmail.com', '9368210166', '01', 'Kashipt', 'Uttarakhand ', '244713', 'cod', 'shipped', 125000.00),
('a69554ae-91e9-4cd7-ae39-cb5a3212b2be', 'OM rawat', 'omrawat5999@okhdfcbank', '06397031644', 'Bagi', 'Dehradun', 'Uttarakhand', '248001', 'card', 'pending', 18000.00),
('a6912b1d-08b9-4d94-87f9-64d69c93f481', 'OM rawat', 'omrawat5999@okhdfcbank', '06397031644', 'Bagi', 'Dehradun', 'Uttarakhand', '248001', 'cod', 'pending', 315000.00);

-- Order Items Data
INSERT INTO public.order_items (id, order_id, product_id, product_name, quantity, price) VALUES
('8f41b4d4-56e8-4083-9c4b-75f036941d50', '89274af1-22de-4624-822e-0906ecfdeb5e', 'd028a0dc-e2c4-46f6-a4de-efff74d1fd18', 'Gold Temple Necklace', 1, 95000.00),
('efdadb5b-0606-42a3-a1d3-62d75e6e25c0', '2390458b-f468-4f69-8d53-3ca6e399020f', 'f65d083d-256a-45cb-b165-fc85a4b03bf9', 'Royal Diamond Necklace', 3, 125000.00),
('a6d61930-5ba4-429f-ba2a-8714c57fc432', '0eb6913c-ba73-42b8-862f-2d9af2d7eb0f', 'f65d083d-256a-45cb-b165-fc85a4b03bf9', 'Royal Diamond Necklace', 1, 125000.00),
('deb474d2-a913-4c27-b936-27adcf9f5e12', '9fd082aa-64e8-4cef-b5f4-9a7fcd450d9b', 'f65d083d-256a-45cb-b165-fc85a4b03bf9', 'Royal Diamond Necklace', 1, 125000.00),
('2ed45a4e-70f4-49a5-81cb-c219d9b98acf', 'a69554ae-91e9-4cd7-ae39-cb5a3212b2be', '8705b2fe-5d7f-4be3-86d9-6decbf357862', 'Pearl Bracelet', 1, 18000.00),
('fde4b8ac-1124-4d8a-879a-cc02fc2664b1', 'a6912b1d-08b9-4d94-87f9-64d69c93f481', '54519326-4d65-42ae-8f3c-75774e76a981', 'Emerald Drop Earrings', 7, 45000.00);

-- Admin Users (you'll need to set your own password hash)
-- Default admin username: admin
-- INSERT INTO public.admin_users (username, password_hash) VALUES ('admin', 'YOUR_BCRYPT_HASH_HERE');
