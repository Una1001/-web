-- SQL to create tables for the -web app (run in Supabase SQL Editor)

-- customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- vip_customers table (separate if you want different semantics)
CREATE TABLE IF NOT EXISTS public.vip_customers (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  contact text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- products table
CREATE TABLE IF NOT EXISTS public.products (
  id bigserial PRIMARY KEY,
  description text NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id bigserial PRIMARY KEY,
  customer text NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security and create simple public policies for anon (use with caution)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/select and insert (adjust according to your security needs)
-- Drop policies if they already exist to make this script re-runnable
DROP POLICY IF EXISTS "public_select_customers" ON public.customers;
DROP POLICY IF EXISTS "public_insert_customers" ON public.customers;
CREATE POLICY "public_select_customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "public_insert_customers" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_vip_customers" ON public.vip_customers;
DROP POLICY IF EXISTS "public_insert_vip_customers" ON public.vip_customers;
CREATE POLICY "public_select_vip_customers" ON public.vip_customers FOR SELECT USING (true);
CREATE POLICY "public_insert_vip_customers" ON public.vip_customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_vendors" ON public.vendors;
DROP POLICY IF EXISTS "public_insert_vendors" ON public.vendors;
CREATE POLICY "public_select_vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "public_insert_vendors" ON public.vendors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_products" ON public.products;
DROP POLICY IF EXISTS "public_insert_products" ON public.products;
CREATE POLICY "public_select_products" ON public.products FOR SELECT USING (true);
CREATE POLICY "public_insert_products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_orders" ON public.orders;
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
CREATE POLICY "public_select_orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "public_insert_orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Note: granting anonymous insert/select to public is convenient for dev but not secure for production.
-- For production, implement RLS conditions and use server-side functions or authenticated users.
