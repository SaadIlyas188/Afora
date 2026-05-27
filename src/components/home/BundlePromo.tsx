'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function BundlePromo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    if (isInView) {
      let current = 0;
      const target = 3800;
      const step = target / 40;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setSavings(Math.round(current));
      }, 25);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <section ref={ref} className="py-20 md:py-32 px-6 md:px-12 bg-foreground text-gold-50">
      <div className="max-w-[1000px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold-600" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-gold-400">
              Complete Your Ritual
            </span>
            <div className="w-8 h-px bg-gold-600" />
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-light tracking-wide text-gold-50 mb-6">
            The Complete System
          </h2>
          <p className="text-sm md:text-base font-body text-gold-400 max-w-lg mx-auto mb-12 md:mb-16 font-light">
            All 6 products in our luxury facial system at an exclusive bundle price.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12 md:mb-16"
        >
          <div className="text-center">
            <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold-500 mb-2">Individual</p>
            <p className="text-lg md:text-xl font-heading text-gold-400 line-through font-light">{formatPrice(11250)}</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-gold-700" />
          <div className="text-center">
            <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold-300 mb-2">Bundle Price</p>
            <p className="text-3xl md:text-4xl font-heading font-light text-gold-50">{formatPrice(7450)}</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-gold-700" />
          <div className="text-center">
            <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold-300 mb-2">You Save</p>
            <p className="text-xl md:text-2xl font-heading font-light text-gold-300">
              {formatPrice(savings)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/bundle">
            <span className="inline-flex items-center justify-center px-12 py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-body font-medium border border-gold-50 text-gold-50 hover:bg-gold-50 hover:text-foreground transition-all duration-400">
              Shop the Bundle
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
