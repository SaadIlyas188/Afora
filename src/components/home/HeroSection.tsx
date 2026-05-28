'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-gold-50 pb-8 md:pb-0">
      {/* Background — no harsh split, just elegant depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft central radial warmth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,rgba(201,185,154,0.18)_0%,transparent_80%)]" />
        {/* Corner frame accents */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.4 }}
          className="absolute top-6 left-6 md:top-10 md:left-10 w-10 h-10 md:w-16 md:h-16 border-l border-t border-gold-400/35"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.4 }}
          className="absolute top-6 right-6 md:top-10 md:right-10 w-10 h-10 md:w-16 md:h-16 border-r border-t border-gold-400/35"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="absolute bottom-5 left-6 md:bottom-14 md:left-10 w-10 h-10 md:w-16 md:h-16 border-l border-b border-gold-400/35"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="absolute bottom-5 right-6 md:bottom-14 md:right-10 w-10 h-10 md:w-16 md:h-16 border-r border-b border-gold-400/35"
        />
        {/* Slim vertical accent lines — desktop only */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.8, ease: 'easeOut' }}
          className="hidden md:block absolute left-[8%] top-[18%] w-px h-[22%] origin-top"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,185,154,0.4), transparent)' }}
        />
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.0, ease: 'easeOut' }}
          className="hidden md:block absolute right-[8%] top-[22%] w-px h-[18%] origin-top"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,185,154,0.3), transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full">
        <div className="flex flex-col items-center text-center">
          {/* Overline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-4 mb-4 md:mb-10"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '3rem' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-gold-400/60 overflow-hidden"
              style={{ minWidth: 0 }}
            />
            <span className="text-[10px] md:text-[11px] font-body font-medium tracking-[0.3em] uppercase text-muted">
              Luxury Skincare
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '3rem' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-gold-400/60 overflow-hidden"
              style={{ minWidth: 0 }}
            />
          </motion.div>

          {/* Main Title — golden */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[clamp(3.6rem,13vw,9rem)] font-heading font-light tracking-[0.15em] leading-[0.85] mb-3 md:mb-4"
            style={{ color: '#c8a951' }}
          >
            AFORA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-sm md:text-base font-heading font-light tracking-[0.2em] text-foreground/70 mb-4 md:mb-14"
          >
            by Sidra Shahzad
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-sm md:text-lg font-body font-light text-muted leading-relaxed mb-6 md:mb-14 max-w-md mx-auto"
          >
            A 6-step facial ritual crafted for luminous,{' '}
            <br className="hidden md:block" />
            healthy skin you can feel.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            <Link href="/products" className="block w-full sm:w-auto">
              <span className="btn-gold w-full sm:w-auto inline-flex items-center justify-center px-10 py-3.5 md:py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-body font-medium">
                <span className="relative z-10">Shop Collection</span>
              </span>
            </Link>
            <Link href="/bundle" className="block w-full sm:w-auto">
              <span className="btn-gold-outline w-full sm:w-auto inline-flex items-center justify-center px-10 py-3.5 md:py-4 rounded-none text-[11px] tracking-[0.2em] uppercase font-body font-medium">
                The Complete Ritual
              </span>
            </Link>
          </motion.div>

          {/* Minimal info strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex items-center gap-8 md:gap-12 mt-8 md:mt-24"
          >
            {['6-Step System', 'Premium Formulas', 'Nationwide Delivery'].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-3 bg-gold-400/30" />}
                <span className="text-[10px] md:text-[11px] font-body tracking-[0.1em] uppercase text-muted font-light">
                  {item}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom vertical line — desktop only */}
      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
          className="w-px h-10 origin-top"
          style={{ background: 'linear-gradient(to bottom, rgba(201,185,154,0.6), transparent)' }}
        />
      </div>
    </section>
  );
}
