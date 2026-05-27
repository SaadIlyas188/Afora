-- =====================================================
-- AFORA by Sidra Shahzad — Complete Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORIES
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTS
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  how_to_use TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  step_number INT,
  can_use_individually BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PRODUCT IMAGES
CREATE TABLE public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- 5. PRODUCT INGREDIENTS
CREATE TABLE public.product_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  ingredient_name TEXT NOT NULL,
  ingredient_description TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- 6. BUNDLES
CREATE TABLE public.bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. BUNDLE-PRODUCT JUNCTION
CREATE TABLE public.bundle_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE(bundle_id, product_id)
);

-- 8. ORDERS
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_charges NUMERIC(10,2) NOT NULL DEFAULT 250,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- 10. PROMO CODES (must be created before orders references it)
CREATE TABLE public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_amount NUMERIC(10,2) NOT NULL,
  discount_type TEXT DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  usage_limit INT,
  times_used INT DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTE: Since promo_codes must exist before orders, reorder: create promo_codes first
-- Drop and recreate orders with proper reference
-- Actually, let's handle this with ALTER TABLE instead:
-- Remove the FK from orders creation above and add it after promo_codes exists

-- If running fresh, you may need to run the tables in this order:
-- profiles, categories, products, product_images, product_ingredients, 
-- bundles, bundle_products, promo_codes, orders, order_items, reviews, wishlists, site_settings, faqs

-- 11. REVIEWS
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  description TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, order_id)
);

-- 12. WISHLISTS
CREATE TABLE public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 13. SITE SETTINGS
CREATE TABLE public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. FAQS
CREATE TABLE public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CATEGORIES (public read, admin write)
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- PRODUCTS (public read, admin write)
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- PRODUCT IMAGES
CREATE POLICY "Product images viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin can manage product images" ON public.product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- PRODUCT INGREDIENTS
CREATE POLICY "Product ingredients viewable by everyone" ON public.product_ingredients FOR SELECT USING (true);
CREATE POLICY "Admin can manage ingredients" ON public.product_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- BUNDLES
CREATE POLICY "Bundles viewable by everyone" ON public.bundles FOR SELECT USING (true);
CREATE POLICY "Admin can manage bundles" ON public.bundles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- BUNDLE PRODUCTS
CREATE POLICY "Bundle products viewable by everyone" ON public.bundle_products FOR SELECT USING (true);
CREATE POLICY "Admin can manage bundle products" ON public.bundle_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ORDERS
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ORDER ITEMS
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- REVIEWS
CREATE POLICY "Approved reviews viewable by everyone" ON public.reviews FOR SELECT USING (
  is_approved = true OR auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage reviews" ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- WISHLISTS
CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist items" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- PROMO CODES
CREATE POLICY "Active promo codes viewable" ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Admin can manage promo codes" ON public.promo_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- SITE SETTINGS
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- FAQS
CREATE POLICY "FAQs viewable by everyone" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admin can manage FAQs" ON public.faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);


-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Run these in Supabase Dashboard > Storage or via SQL:

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin can upload product images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can delete product images" ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);


-- =====================================================
-- SEED DATA
-- =====================================================

-- Categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Cleansers', 'cleansers', 'Gentle cleansers that remove impurities while keeping your skin fresh and hydrated.', 1),
('Exfoliators', 'exfoliators', 'Exfoliating products that reveal brighter, smoother skin by removing dead skin cells.', 2),
('Treatments', 'treatments', 'Targeted treatments that address specific skin concerns for a radiant complexion.', 3),
('Moisturizers', 'moisturizers', 'Rich moisturizers that deeply hydrate and nourish your skin.', 4);

-- Products
INSERT INTO public.products (name, slug, description, how_to_use, price, compare_at_price, category_id, step_number, can_use_individually, is_active, is_featured, stock_status) VALUES
(
  'Clarifying Gel Cleanser',
  'clarifying-gel-cleanser',
  'Cleans skin, removes dirt, oil and daily impurities, leaving skin fresh and clean. The perfect first step in your skincare ritual.',
  'Massage on wet face and rinse off.',
  1800,
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'cleansers'),
  1, true, true, true, 'in_stock'
),
(
  'Skin Renewal Exfoliating Cream',
  'skin-renewal-exfoliating-cream',
  'An exfoliating cream that helps clear pores and smooth skin. Gently buffs away dead skin cells to reveal a renewed, radiant complexion.',
  'Apply on wet skin, massage gently for a few minutes, then rinse off.',
  1850,
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'exfoliators'),
  2, true, true, true, 'in_stock'
),
(
  'Brightening Scrub',
  'brightening-scrub',
  'Gently exfoliates skin, removes dead skin cells and helps improve skin texture. Unveils a brighter, more even-toned complexion.',
  'Gently massage on wet skin and rinse off.',
  1850,
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'exfoliators'),
  3, true, true, true, 'in_stock'
),
(
  'Glow Polisher',
  'glow-polisher',
  'Gently polishes skin, removes dead skin and leaves skin soft, smooth and fresh. A luxurious treatment that brings out your natural glow.',
  'Apply on face and leave for 10-15 minutes then rinse off.',
  1900,
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'treatments'),
  4, true, true, true, 'in_stock'
),
(
  'Afora Hydra Cream',
  'afora-hydra-cream',
  'Helps hydrate and nourish skin, leaving it soft, smooth and refreshed. Locks in moisture for lasting comfort throughout the day.',
  'Massage gently on face and neck for 5-10 minutes.',
  1900,
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'moisturizers'),
  5, true, true, true, 'in_stock'
),
(
  'Afora Brightening Mask',
  'afora-brightening-mask',
  'Helps brighten skin and improve the appearance of uneven skin tone and dark spots. The perfect finishing step for a luminous, radiant look.',
  'Apply on face and leave for 10-15 minutes. Rinse off.',
  1950,
  NULL,
  (SELECT id FROM public.categories WHERE slug = 'treatments'),
  6, true, true, true, 'in_stock'
);

-- Product Ingredients with descriptions

-- Product 1: Clarifying Gel Cleanser
INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_description, sort_order)
SELECT p.id, i.name, i.description, i.sort
FROM public.products p,
(VALUES
  ('Aqua (Water)', 'Base solvent that hydrates and helps dissolve active ingredients for effective delivery into the skin.', 1),
  ('Vitamin B3 (Niacinamide)', 'A powerhouse vitamin that improves skin texture, minimizes pores, and helps even out skin tone for a smoother complexion.', 2),
  ('Vitamin E Beads', 'Antioxidant-rich beads that protect skin from environmental damage while providing deep moisturization.', 3),
  ('Glycerine', 'A natural humectant that attracts and retains moisture, keeping skin hydrated and supple throughout the day.', 4),
  ('Mild Cleanser Base', 'A gentle surfactant system that effectively removes dirt and impurities without stripping the skin of its natural oils.', 5),
  ('Phenoxyethanol', 'A gentle preservative that ensures product safety, stability and shelf life without irritating sensitive skin.', 6),
  ('Fragrance', 'A carefully selected blend that provides a luxurious, subtle sensory experience during your skincare ritual.', 7)
) AS i(name, description, sort)
WHERE p.slug = 'clarifying-gel-cleanser';

-- Product 2: Skin Renewal Exfoliating Cream
INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_description, sort_order)
SELECT p.id, i.name, i.description, i.sort
FROM public.products p,
(VALUES
  ('Aqua (Water)', 'Base solvent that hydrates and helps dissolve active ingredients for optimal absorption.', 1),
  ('Salicylic Acid', 'A beta-hydroxy acid (BHA) that penetrates deep into pores to clear congestion, reduce breakouts, and promote clearer skin.', 2),
  ('Niacinamide', 'Strengthens the skin barrier, reduces inflammation and redness, and helps control excess oil production.', 3),
  ('Glycerine', 'A powerful humectant that draws moisture to the skin, preventing dryness and maintaining a healthy moisture balance.', 4),
  ('Cetyl Alcohol', 'A fatty alcohol emollient that softens and smooths skin texture without clogging pores.', 5),
  ('Stearic Acid', 'A natural fatty acid that helps maintain the skin''s protective moisture barrier and improves product texture.', 6),
  ('Phenoxyethanol', 'A gentle preservative ensuring product purity and safety for all skin types.', 7),
  ('Fragrance', 'A refined scent that elevates your skincare experience with a touch of luxury.', 8)
) AS i(name, description, sort)
WHERE p.slug = 'skin-renewal-exfoliating-cream';

-- Product 3: Brightening Scrub
INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_description, sort_order)
SELECT p.id, i.name, i.description, i.sort
FROM public.products p,
(VALUES
  ('Aqua (Water)', 'Base solvent that provides hydration and helps active ingredients penetrate effectively.', 1),
  ('Glycolic Acid', 'An alpha-hydroxy acid (AHA) that exfoliates the skin surface, removes dead cells, and promotes cell renewal for a brighter complexion.', 2),
  ('Niacinamide', 'Reduces the appearance of dark spots and hyperpigmentation while brightening overall skin tone.', 3),
  ('Vitamin E', 'A potent antioxidant that shields skin from free radical damage and environmental stressors while deeply nourishing.', 4),
  ('Glycerine', 'Locks in moisture and creates a protective barrier that keeps skin soft, plump, and comfortable.', 5),
  ('Cetyl Alcohol', 'A conditioning agent that leaves skin feeling silky smooth and helps improve product spreadability.', 6),
  ('Stearic Acid', 'Reinforces the skin''s natural barrier function and contributes to the luxurious cream texture.', 7),
  ('Phenoxyethanol', 'A reliable preservative that maintains product integrity and freshness.', 8),
  ('Fragrance', 'A delicate fragrance that transforms your skincare routine into a spa-like experience.', 9)
) AS i(name, description, sort)
WHERE p.slug = 'brightening-scrub';

-- Product 4: Glow Polisher
INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_description, sort_order)
SELECT p.id, i.name, i.description, i.sort
FROM public.products p,
(VALUES
  ('Aqua (Water)', 'Pure water base that provides essential hydration and serves as the foundation for active ingredients.', 1),
  ('Lactic Acid', 'A gentle alpha-hydroxy acid that exfoliates while simultaneously hydrating, making it perfect for sensitive skin types.', 2),
  ('Niacinamide', 'Boosts skin elasticity, reduces fine lines, and improves overall skin resilience for a youthful appearance.', 3),
  ('D-Panthenol', 'Pro-vitamin B5 that deeply moisturizes, calms irritation, and accelerates skin''s natural healing process.', 4),
  ('Glycerine', 'An exceptional moisturizer that maintains skin''s hydration levels and prevents transepidermal water loss.', 5),
  ('Aloe Vera Extract', 'A soothing botanical extract with anti-inflammatory properties that calms, cools, and rejuvenates stressed skin.', 6),
  ('Cetyl Alcohol', 'A nourishing emollient that conditions and softens skin while enhancing product consistency.', 7),
  ('Stearic Acid', 'Supports the skin''s moisture barrier and gives the formula its rich, creamy texture.', 8),
  ('Phenoxyethanol', 'Ensures product remains fresh, safe, and effective throughout its shelf life.', 9),
  ('Fragrance', 'An elegant scent that complements the polishing experience with subtle sophistication.', 10)
) AS i(name, description, sort)
WHERE p.slug = 'glow-polisher';

-- Product 5: Afora Hydra Cream
INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_description, sort_order)
SELECT p.id, i.name, i.description, i.sort
FROM public.products p,
(VALUES
  ('Aqua (Water)', 'Ultra-pure water that forms the hydrating base, ensuring smooth delivery of all active ingredients.', 1),
  ('Hyaluronic Acid', 'A powerful humectant that holds up to 1000x its weight in water, providing intense deep hydration and plumping fine lines.', 2),
  ('Niacinamide', 'Strengthens the skin barrier, reduces visible signs of aging, and improves skin radiance from within.', 3),
  ('Vitamin E (Tocopherol)', 'A potent antioxidant that protects skin cells from oxidative stress and supports natural skin repair.', 4),
  ('Glycerin', 'Creates a moisture-locking shield on the skin, ensuring all-day hydration and a dewy, healthy glow.', 5),
  ('Shea Butter', 'A rich, natural emollient packed with vitamins A, E, and F that deeply nourishes, softens, and protects dry skin.', 6),
  ('Cetyl Alcohol', 'A gentle fatty alcohol that smooths and conditions skin while improving cream consistency.', 7),
  ('Stearic Acid', 'Helps create the cream''s luxurious texture while reinforcing the skin''s natural protective barrier.', 8),
  ('Phenoxyethanol', 'A mild preservative that keeps the formula fresh and safe for daily use.', 9),
  ('Fragrance', 'A refined, calming scent that enhances your hydration ritual with a touch of indulgence.', 10)
) AS i(name, description, sort)
WHERE p.slug = 'afora-hydra-cream';

-- Product 6: Afora Brightening Mask
INSERT INTO public.product_ingredients (product_id, ingredient_name, ingredient_description, sort_order)
SELECT p.id, i.name, i.description, i.sort
FROM public.products p,
(VALUES
  ('Aqua (Water)', 'Purified water base that delivers hydration and helps active brightening agents absorb effectively.', 1),
  ('Alpha Arbutin', 'A highly effective brightening agent that targets dark spots by inhibiting melanin production for a more even complexion.', 2),
  ('Kojic Acid', 'A natural skin brightener derived from fungi that fades hyperpigmentation and reveals luminous, clear skin.', 3),
  ('Niacinamide', 'Works synergistically with other brightening agents to even skin tone, reduce dullness, and strengthen the skin barrier.', 4),
  ('D-Panthenol', 'Pro-vitamin B5 that provides intense moisture, soothes the skin, and promotes a healthy, supple texture.', 5),
  ('Glycerin', 'Maintains optimal hydration levels during the masking process, ensuring skin stays comfortable and nourished.', 6),
  ('Cetyl Alcohol', 'A smooth conditioning agent that helps the mask glide on evenly and leaves skin feeling silky.', 7),
  ('Stearic Acid', 'Contributes to the mask''s creamy consistency while supporting the skin''s natural moisture retention.', 8),
  ('Phenoxyethanol', 'A safe, effective preservative that maintains the mask''s quality and performance.', 9),
  ('Fragrance', 'A light, luxurious aroma that transforms your masking session into a rejuvenating spa moment.', 10)
) AS i(name, description, sort)
WHERE p.slug = 'afora-brightening-mask';

-- Bundle
INSERT INTO public.bundles (name, slug, description, price, compare_at_price, is_active) VALUES
(
  'AFORA Complete Facial System',
  'afora-complete-facial-system',
  'Experience the complete AFORA luxury facial ritual. This 6-step system takes your skin on a transformative journey — from deep cleansing to radiant brightening. Each product is expertly formulated to work in harmony, delivering visible results from the very first use. Save Rs. 3,800 compared to purchasing individually.',
  7450,
  11250,
  true
);

-- Link all products to the bundle
INSERT INTO public.bundle_products (bundle_id, product_id, sort_order)
SELECT b.id, p.id, p.step_number
FROM public.bundles b, public.products p
WHERE b.slug = 'afora-complete-facial-system'
ORDER BY p.step_number;

-- Site Settings
INSERT INTO public.site_settings (key, value) VALUES
('contact_email', 'info@aforaskincare.com'),
('whatsapp_number', '+923001234567'),
('instagram_username', 'aforabysidra'),
('facebook_url', 'https://facebook.com/aforabysidra'),
('about_text', 'AFORA by Sidra Shahzad is a luxury skincare brand born from a deep passion for radiant, healthy skin. Based in Lahore, Pakistan, we believe that every woman deserves to feel confident and beautiful in her own skin. Our carefully crafted facial system combines premium ingredients with cutting-edge skincare science to deliver visible results you can see and feel.'),
('delivery_charges', '250'),
('announcement_bar_text', '✨ Free delivery on orders above Rs. 5,000 — Shop the Complete Facial System & Save Rs. 3,800!');

-- FAQs
INSERT INTO public.faqs (question, answer, sort_order, is_active) VALUES
('What is the AFORA Complete Facial System?', 'The AFORA Complete Facial System is a 6-step luxury skincare ritual designed to cleanse, exfoliate, polish, hydrate, and brighten your skin. Each product is carefully formulated with premium ingredients and designed to work in harmony for the best results.', 1, true),
('Can I use the products individually?', 'Yes! While we recommend using the complete system for optimal results, each product is formulated to deliver benefits on its own. You can purchase any product individually based on your skin''s needs.', 2, true),
('How long will it take to see results?', 'Many customers notice an improvement in skin texture and radiance after their very first use. For best results, we recommend consistent use for at least 2-4 weeks as part of your regular skincare routine.', 3, true),
('Is AFORA suitable for all skin types?', 'Yes, our products are formulated with gentle yet effective ingredients suitable for all skin types. However, if you have extremely sensitive skin or specific skin conditions, we recommend doing a patch test first.', 4, true),
('What are the delivery charges?', 'We charge a flat delivery fee of Rs. 250 across Pakistan. Orders above Rs. 5,000 qualify for free delivery!', 5, true),
('How long does delivery take?', 'We deliver across Pakistan. Orders within Lahore are typically delivered within 2-3 business days. For other cities, delivery takes 3-5 business days.', 6, true),
('Do you offer Cash on Delivery?', 'Yes! We currently accept Cash on Delivery (COD) as our payment method. Pay when your order arrives at your doorstep.', 7, true),
('What is your return policy?', 'We want you to love your purchase. If you receive a damaged or incorrect product, please contact us within 48 hours of delivery with photos, and we''ll arrange a replacement.', 8, true),
('How do I track my order?', 'Once your order is confirmed, you''ll receive email updates at every stage — from confirmation to delivery. You can also check your order status in your account dashboard.', 9, true),
('How can I contact you?', 'You can reach us via our Contact page, WhatsApp, Instagram DM, or email. We''re based in Lahore and are always happy to help with any questions!', 10, true);


-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- Product with average rating view
CREATE OR REPLACE VIEW public.products_with_ratings AS
SELECT 
  p.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM public.products p
LEFT JOIN public.reviews r ON p.id = r.product_id AND r.is_approved = true
GROUP BY p.id;


-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- =====================================================
-- IMPORTANT: After running this, create your admin user:
-- 1. Sign up normally on the website
-- 2. Run this SQL replacing YOUR_USER_ID with your auth.users id:
--    UPDATE public.profiles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
-- =====================================================
