'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('step_number');

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from('products').select('*, category:categories(*), images:product_images(*)').eq('is_active', true),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([productsRes, categoriesRes]) => {
      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    });
  }, []);

  const filtered = products
    .filter((p) => activeCategory === 'all' || p.category_id === activeCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return (a.step_number || 99) - (b.step_number || 99);
      }
    });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-cream-100 to-cream-50 py-12 md:py-20 px-4 text-center">
        <AnimatedSection>
          <p className="text-xs md:text-sm tracking-[0.3em] text-gold-400 uppercase mb-3">Our Collection</p>
          <h1 className="text-3xl md:text-5xl font-bold font-heading gold-gradient-text mb-3">Shop All Products</h1>
          <p className="text-sm md:text-base text-muted max-w-lg mx-auto">
            Discover our expertly crafted skincare essentials for every step of your beauty ritual.
          </p>
        </AnimatedSection>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'gold-gradient-bg text-white shadow-sm'
                  : 'bg-white border border-gold-100 text-muted hover:border-gold-200'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'gold-gradient-bg text-white shadow-sm'
                    : 'bg-white border border-gold-100 text-muted hover:border-gold-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gold-100 text-sm bg-white text-muted focus:outline-none focus:border-gold-200"
          >
            <option value="step_number">Step Order</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + sortBy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
