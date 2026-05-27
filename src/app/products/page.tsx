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
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center px-6 md:px-12">
        <AnimatedSection>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">Our Collection</span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-light text-foreground tracking-wide mb-4">Shop</h1>
          <p className="text-sm md:text-base font-body text-muted font-light max-w-lg mx-auto">
            Discover our expertly crafted skincare essentials for every step of your beauty ritual.
          </p>
        </AnimatedSection>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-16">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 text-[10px] md:text-[11px] font-body font-medium tracking-[0.15em] uppercase whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === 'all'
                  ? 'bg-foreground text-gold-50 border-foreground'
                  : 'bg-transparent border-gold-200/60 text-muted hover:border-foreground hover:text-foreground'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-[10px] md:text-[11px] font-body font-medium tracking-[0.15em] uppercase whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === cat.id
                    ? 'bg-foreground text-gold-50 border-foreground'
                    : 'bg-transparent border-gold-200/60 text-muted hover:border-foreground hover:text-foreground'
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
            className="px-4 py-2.5 border border-gold-200/60 text-[11px] font-body tracking-[0.1em] uppercase bg-transparent text-muted focus:outline-none focus:border-foreground"
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm font-body text-muted">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
