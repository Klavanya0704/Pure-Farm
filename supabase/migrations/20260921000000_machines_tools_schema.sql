-- Migration: Add machines_tools table for agricultural machinery & equipment rental
CREATE TABLE IF NOT EXISTS public.machines_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT NOT NULL,
  rental_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  rate_unit TEXT NOT NULL DEFAULT 'hr' CHECK (rate_unit IN ('hr', 'day', 'week')),
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'booked', 'maintenance')),
  condition TEXT NOT NULL DEFAULT 'Good' CHECK (condition IN ('Excellent', 'Good', 'Fair')),
  specifications TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.machines_tools ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active machines
CREATE POLICY "Public machines are viewable by everyone" 
  ON public.machines_tools FOR SELECT 
  USING (status = 'active');

-- Allow farmers to insert their own machinery listings
CREATE POLICY "Farmers can create machine listings" 
  ON public.machines_tools FOR INSERT 
  WITH CHECK (auth.uid() = farmer_id OR farmer_id IS NULL);

-- Allow owners to update their own machinery listings
CREATE POLICY "Owners can update own machinery listings" 
  ON public.machines_tools FOR UPDATE 
  USING (auth.uid() = farmer_id);
