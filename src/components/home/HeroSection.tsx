'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-cream-100 to-gold-50 min-h-[85vh] md:min-h-[90vh] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-gold-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-gold-200/30 blur-3xl" />
        {/* Gold leaf shapes */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-10 md:right-32 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gold-200/20 to-gold-300/10"
        />
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-32 left-10 md:left-32 w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gold-300/15 to-gold-200/10"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full py-20 md:py-0">
        <div className="text-center max-w-3xl mx-auto">
          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs md:text-sm tracking-[0.3em] text-gold-400 uppercase mb-4 md:mb-6"
          >
            Luxury Facial & Skincare System
          </motion.p>

          {/* Logo/Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.1em] gold-gradient-text font-heading mb-2"
          >
            AFORA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-2xl italic text-gold-400 font-heading mb-6 md:mb-8"
          >
            by Sidra Shahzad
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-base md:text-xl text-foreground/60 leading-relaxed mb-8 md:mb-10 max-w-xl mx-auto"
          >
            Experience the luxury. Reveal your radiance.
            <br className="hidden md:block" />
            A 6-step facial system crafted for luminous, healthy skin.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto text-base px-10">
                Shop Collection
              </Button>
            </Link>
            <Link href="/bundle">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-10">
                The Complete Ritual
              </Button>
            </Link>
          </motion.div>

          {/* Features Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12 md:mt-16"
          >
            {[
              { icon: '✨', label: 'Glowing Skin' },
              { icon: '💧', label: 'Deep Hydration' },
              { icon: '🌿', label: 'Natural Glow' },
              { icon: '💎', label: 'Premium Quality' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5">
                <span className="text-xl md:text-2xl">{item.icon}</span>
                <span className="text-[10px] md:text-xs text-muted uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cream-50 to-transparent" />
    </section>
  );
}
