'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';

export default function HomeBundles() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('bundles')
      .select('*, bundle_products(product_id)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setBundles(data);
        setLoaded(true);
      });
  }, []);

  if (loaded && bundles.length === 0) return null;

  return (
    <section className="py-10 md:py-16 px-5 md:px-12 bg-cream-200" style={{ backgroundColor: '#ede9e0' }}>
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-px" style={{ backgroundColor: '#c8a951' }} />
            <span className="text-[10px] font-body tracking-[0.28em] uppercase text-muted">Curated Sets</span>
          </div>
          <Link href="/bundle" className="flex items-center gap-1.5 text-[10px] font-body tracking-[0.15em] uppercase hover:opacity-70 transition-opacity" style={{ color: '#c8a951' }}>
            View All <ArrowRight size={11} />
          </Link>
        </div>

        <h2 className="text-2xl md:text-4xl font-heading font-light text-foreground tracking-wide mb-8 md:mb-12">
          Bundle & Save
        </h2>

        {/* Cards grid */}
        {!loaded ? (
          // Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-40 bg-gold-100/60 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundles.map((bundle, idx) => {
              const savings = bundle.compare_at_price
                ? bundle.compare_at_price - bundle.price
                : null;
              const productCount = bundle.bundle_products?.length ?? 0;

              return (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                >
                  <Link href={`/bundle`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl border border-gold-200/60 bg-white hover:border-[#c8a951]/50 hover:shadow-lg transition-all duration-300 p-5 md:p-6">

                      {/* Save badge */}
                      {savings && savings > 0 && (
                        <div
                          className="absolute top-4 right-4 text-[9px] font-body font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: '#c8a951' }}
                        >
                          Save {formatPrice(savings)}
                        </div>
                      )}

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center mb-4" style={{ border: '1.5px solid rgba(200,169,81,0.3)' }}>
                        <Package size={16} style={{ color: '#c8a951' }} strokeWidth={1.5} />
                      </div>

                      {/* Name & count */}
                      <h3 className="text-base md:text-lg font-heading font-light text-foreground tracking-wide mb-1 group-hover:text-[#c8a951] transition-colors leading-snug">
                        {bundle.name}
                      </h3>
                      {productCount > 0 && (
                        <p className="text-[10px] font-body tracking-[0.1em] uppercase text-muted mb-3">
                          {productCount} product{productCount !== 1 ? 's' : ''}
                        </p>
                      )}

                      {/* Description - truncated */}
                      {bundle.description && (
                        <p className="text-xs font-body text-muted/80 font-light line-clamp-2 mb-4">
                          {bundle.description}
                        </p>
                      )}

                      {/* Pricing row */}
                      <div className="flex items-end justify-between mt-auto pt-3 border-t border-gold-100">
                        <div>
                          <p className="text-lg font-heading font-light text-foreground">
                            {formatPrice(bundle.price)}
                          </p>
                          {bundle.compare_at_price && (
                            <p className="text-[11px] text-muted line-through font-body">
                              {formatPrice(bundle.compare_at_price)}
                            </p>
                          )}
                        </div>
                        <div
                          className="flex items-center gap-1 text-[10px] font-body font-medium tracking-[0.15em] uppercase group-hover:gap-2 transition-all"
                          style={{ color: '#c8a951' }}
                        >
                          Shop <ArrowRight size={10} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
