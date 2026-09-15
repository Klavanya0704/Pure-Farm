-- ==============================================================================
-- PURE FARM DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Users & Roles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer', 'student', 'admin', 'seller')),
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('seeds', 'fertilizers', 'tools', 'grains', 'fruits', 'vegetables', 'pulses', 'oilseeds', 'spices', 'other')),
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  available_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  location TEXT,
  image_url TEXT,
  quality TEXT DEFAULT 'Grade A',
  harvest_date DATE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'inactive')),
  rating NUMERIC(3, 2) DEFAULT 0.00,
  badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  delivery_location TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod', 'online', 'upi', 'bank_transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. MARKET PRICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT 'quintal',
  change_pct NUMERIC(5, 2) DEFAULT 0.00,
  source TEXT DEFAULT 'Agmarknet Mandi Record',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. COLD STORAGE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cold_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  distance NUMERIC(8, 2),
  capacity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  available_capacity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  contact_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'full', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_state ON public.market_prices(crop_name, state);
CREATE INDEX IF NOT EXISTS idx_market_prices_recorded_at ON public.market_prices(recorded_at);

CREATE INDEX IF NOT EXISTS idx_cold_storage_status ON public.cold_storage(status);

-- ------------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- ------------------------------------------------------------------------------

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_market_prices_updated_at ON public.market_prices;
CREATE TRIGGER set_market_prices_updated_at
  BEFORE UPDATE ON public.market_prices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cold_storage_updated_at ON public.cold_storage;
CREATE TRIGGER set_cold_storage_updated_at
  BEFORE UPDATE ON public.cold_storage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for auth.users signup -> public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    email,
    role,
    location,
    avatar_url
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'PureFarm User'),
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_storage ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
-- Anyone authenticated can view public profiles (e.g. farmer or seller details)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. PRODUCTS POLICIES
-- Active and available products are viewable by everyone (authenticated + anon)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (status != 'inactive' OR auth.uid() = farmer_id);

-- Farmers can insert their own products
CREATE POLICY "Farmers can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() = farmer_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'farmer' OR role = 'seller' OR role = 'admin')
    )
  );

-- Farmers can update their own products
CREATE POLICY "Farmers can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Farmers can delete their own products
CREATE POLICY "Farmers can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. ORDERS POLICIES
-- Buyers can view their own orders; Farmers can view orders containing their sales
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = buyer_id OR
    auth.uid() = farmer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers or Farmers can update their orders (e.g. status change)
CREATE POLICY "Users can update their relevant orders"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = buyer_id OR
    auth.uid() = farmer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = buyer_id OR
    auth.uid() = farmer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. ORDER ITEMS POLICIES
-- View order items if user is the buyer or farmer of the order
CREATE POLICY "Users can view relevant order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = order_items.product_id
      AND products.farmer_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Buyers can insert order items when creating their order
CREATE POLICY "Buyers can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- 5. MARKET PRICES POLICIES
-- Everyone can view market prices
CREATE POLICY "Market prices viewable by everyone"
  ON public.market_prices FOR SELECT
  USING (true);

-- Only admins/managers can insert or update market prices
CREATE POLICY "Admins can manage market prices"
  ON public.market_prices FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. COLD STORAGE POLICIES
-- Everyone can view cold storage facilities
CREATE POLICY "Cold storage viewable by everyone"
  ON public.cold_storage FOR SELECT
  USING (true);

-- Only admins can manage cold storage records
CREATE POLICY "Admins can manage cold storage"
  ON public.cold_storage FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ------------------------------------------------------------------------------
-- ATOMIC STOCK DECREMENT FUNCTION (CONCURRENCY-SAFE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id UUID,
  p_quantity NUMERIC(12, 2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock NUMERIC(12, 2);
  v_new_stock NUMERIC(12, 2);
  v_new_status TEXT;
  v_product_name TEXT;
BEGIN
  -- Lock row for update to prevent concurrent race conditions
  SELECT name, available_quantity INTO v_product_name, v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found', p_product_id;
  END IF;

  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Only % units of "%" are currently available.', v_current_stock, v_product_name;
  END IF;

  v_new_stock := v_current_stock - p_quantity;
  IF v_new_stock <= 0 THEN
    v_new_stock := 0;
    v_new_status := 'sold_out';
  ELSE
    v_new_status := 'available';
  END IF;

  UPDATE public.products
  SET available_quantity = v_new_stock,
      status = v_new_status,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_product_id;

  RETURN jsonb_build_object(
    'product_id', p_product_id,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock,
    'status', v_new_status
  );
END;
$$;

