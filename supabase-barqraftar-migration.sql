-- BarqRaftar Courier Integration Migration
-- Run this in your Supabase SQL Editor

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS barqraftar_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS barqraftar_status TEXT,
  ADD COLUMN IF NOT EXISTS barqraftar_order_id INTEGER;
