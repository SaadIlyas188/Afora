'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('step_number')
      .limit(6)
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-cream-100/50">
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">
              Our Collection
            </span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-light text-foreground tracking-wide mb-4">
            Featured Products
          </h2>
          <p className="text-sm md:text-base font-body text-muted max-w-md mx-auto font-light">
            Expertly formulated skincare essentials for radiant skin.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        <div className="text-center mt-12 md:mt-16">
          <Link href="/products">
            <span className="btn-gold-outline inline-flex items-center justify-center px-10 py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-body font-medium">
              View All Products
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
