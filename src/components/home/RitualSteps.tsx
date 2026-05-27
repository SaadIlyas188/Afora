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
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
    <section ref={ref} className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <p className="text-xs md:text-sm tracking-[0.3em] text-gold-400 uppercase mb-3">
          The Complete Facial System
        </p>
        <h2 className="text-3xl md:text-5xl font-bold font-heading gold-gradient-text mb-4">
          The Ritual
        </h2>
        <p className="text-sm md:text-base text-muted max-w-lg mx-auto">
          Six expertly crafted steps to transform your skin. Follow the ritual for radiant, luminous results.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {products.map((product, index) => {
          const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/products/${product.slug}`} className="group block text-center">
                <div className="relative mb-3 md:mb-4">
                  {/* Step number */}
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full gold-gradient-bg flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs md:text-sm font-bold">{product.step_number}</span>
                  </div>
                  {/* Image */}
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-100 border border-gold-100/50 group-hover:border-gold-200 transition-all group-hover:shadow-md">
                    <Image
                      src={getImageUrl(primaryImage?.image_url ?? null)}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {/* Connector line (not on last item) */}
                  {index < products.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gold-200" />
                  )}
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-foreground leading-tight line-clamp-2 mb-1 font-heading">
                  {product.name}
                </h3>
                <p className="text-xs text-gold-500 font-medium">{formatPrice(product.price)}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
