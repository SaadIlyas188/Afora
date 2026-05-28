-- =====================================================
-- AFORA — Database Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- 1. Add short_description column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description TEXT;

-- 2. Create bundle_images table (used for multi-image bundles)
CREATE TABLE IF NOT EXISTS public.bundle_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- Enable RLS on bundle_images
ALTER TABLE public.bundle_images ENABLE ROW LEVEL SECURITY;

-- Drop policies first in case they already exist, then recreate
DROP POLICY IF EXISTS "Bundle images viewable by everyone" ON public.bundle_images;
DROP POLICY IF EXISTS "Admin can manage bundle images" ON public.bundle_images;

CREATE POLICY "Bundle images viewable by everyone" ON public.bundle_images
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage bundle images" ON public.bundle_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
