'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, useInView } from 'framer-motion';
import type { Product } from '@/types';
import Link from 'next/link';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Image from 'next/image';

export default function RitualSteps() {
  const [products, setProducts] = useState<Product[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('is_active', true)
      .not('step_number', 'is', null)
      .order('step_number')
      .then(({ data }) => {
        if (data) setProducts(data as Product[]);
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="py-20 md:py-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">
              The Complete System
            </span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-light text-foreground tracking-wide mb-4">
            The Ritual
          </h2>
          <p className="text-sm md:text-base font-body text-muted max-w-md mx-auto font-light">
            Six expertly crafted steps to transform your skin.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {products.map((product, index) => {
            const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/products/${product.slug}`} className="group block text-center">
                  <div className="relative mb-4 md:mb-5">
                    <div className="absolute -top-3 -left-1 z-10 text-[11px] font-body font-medium tracking-[0.15em] text-muted">
                      0{product.step_number}
                    </div>
                    <div className="aspect-[3/4] overflow-hidden bg-cream-200">
                      <Image
                        src={getImageUrl(primaryImage?.image_url ?? null)}
                        alt={product.name}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="text-xs md:text-sm font-heading font-medium text-foreground leading-tight mb-1 tracking-wide">
                    {product.name}
                  </h3>
                  <p className="text-xs font-body text-muted">{formatPrice(product.price)}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
