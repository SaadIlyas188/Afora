'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import Button from '@/components/ui/Button';

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
    <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm tracking-[0.3em] text-gold-400 uppercase mb-3">
            Our Collection
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-heading gold-gradient-text mb-4">
            Featured Products
          </h2>
          <p className="text-sm md:text-base text-muted max-w-lg mx-auto">
            Discover our expertly formulated skincare essentials, designed to reveal your most radiant skin.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/products">
            <Button variant="outline" size="lg">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
