'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
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
    <section ref={ref} className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cream-200 via-cream-100 to-gold-50 p-8 md:p-16"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 md:w-72 md:h-72 rounded-full bg-gold-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 md:w-60 md:h-60 rounded-full bg-gold-100/30 blur-3xl" />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-xs md:text-sm tracking-[0.3em] text-gold-500 uppercase mb-3">
                Complete Your Ritual
              </p>
              <h2 className="text-3xl md:text-5xl font-bold font-heading gold-gradient-text mb-4">
                AFORA Complete Facial System
              </h2>
              <p className="text-sm md:text-base text-muted max-w-2xl mx-auto mb-8">
                Get all 6 products in our luxury facial system at an exclusive bundle price.
                Transform your skincare routine with the complete AFORA experience.
              </p>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8"
            >
              <div className="text-center">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Individual Total</p>
                <p className="text-xl md:text-2xl text-muted line-through">{formatPrice(11250)}</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-gold-200" />
              <div className="text-center">
                <p className="text-xs text-gold-500 uppercase tracking-wider mb-1">Bundle Price</p>
                <p className="text-3xl md:text-4xl font-bold gold-gradient-text">{formatPrice(7450)}</p>
              </div>
              <div className="hidden md:block w-px h-12 bg-gold-200" />
              <div className="text-center">
                <p className="text-xs text-green-600 uppercase tracking-wider mb-1">You Save</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {formatPrice(savings)}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link href="/bundle">
                <Button size="lg" className="text-base px-12">
                  Shop the Bundle
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
