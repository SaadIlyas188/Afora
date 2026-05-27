'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-gold-50">
      {/* Subtle background texture */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-cream-200/30" />
        <div className="absolute bottom-0 left-0 w-px h-[40%] bg-gold-300/30 ml-[10%]" />
        <div className="absolute top-[20%] right-[15%] w-px h-[30%] bg-gold-300/20" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full">
        <div className="flex flex-col items-center text-center">
          {/* Overline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-4 mb-8 md:mb-10"
          >
            <div className="w-8 md:w-12 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body font-medium tracking-[0.3em] uppercase text-muted">
              Luxury Skincare
            </span>
            <div className="w-8 md:w-12 h-px bg-gold-300" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-[clamp(3.5rem,12vw,9rem)] font-heading font-light tracking-[0.15em] text-foreground leading-[0.9] mb-4"
          >
            AFORA
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-sm md:text-base font-heading font-light tracking-[0.15em] text-muted mb-10 md:mb-14"
          >
            by Sidra Shahzad
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-sm md:text-lg font-body font-light text-muted leading-relaxed mb-10 md:mb-14 max-w-md mx-auto"
          >
            A 6-step facial ritual crafted for luminous, 
            <br className="hidden md:block" />
            healthy skin you can feel.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/products">
              <span className="btn-gold inline-flex items-center justify-center px-10 py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-body font-medium">
                <span className="relative z-10">Shop Collection</span>
              </span>
            </Link>
            <Link href="/bundle">
              <span className="btn-gold-outline inline-flex items-center justify-center px-10 py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-body font-medium">
                The Complete Ritual
              </span>
            </Link>
          </motion.div>

          {/* Minimal info strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex items-center gap-8 md:gap-12 mt-16 md:mt-24"
          >
            {['6-Step System', 'Premium Formulas', 'Nationwide Delivery'].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-3 bg-gold-300/40" />}
                <span className="text-[10px] md:text-[11px] font-body tracking-[0.1em] uppercase text-muted font-light">
                  {item}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom line accent */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
          className="w-px h-10 bg-gold-300/40 origin-top"
        />
      </div>
    </section>
  );
}
