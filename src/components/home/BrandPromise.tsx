'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, ShieldCheck, Leaf, Truck, Heart, BadgeCheck } from 'lucide-react';

const promises = [
  { icon: Sparkles, label: 'Premium Ingredients', desc: 'Clinically proven' },
  { icon: ShieldCheck, label: 'Dermatologist Approved', desc: 'Safe for all skin' },
  { icon: Leaf, label: 'Gentle Formula', desc: 'No harsh chemicals' },
  { icon: Truck, label: 'Nationwide Delivery', desc: 'Across Pakistan' },
  { icon: Heart, label: 'Crafted with Love', desc: 'Made in Pakistan' },
  { icon: BadgeCheck, label: 'Results Guaranteed', desc: 'Visible results' },
];

export default function BrandPromise() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="py-10 md:py-20 px-4 md:px-12"
      style={{ background: 'linear-gradient(to bottom, #faf8f4, #f7f3eb)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {promises.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.09, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative flex flex-col items-center text-center gap-2 py-4 px-2 md:py-5 md:px-3 cursor-default overflow-hidden"
              style={{ backgroundColor: i % 2 === 0 ? '#faf8f4' : '#f3ede3' }}
            >
              {/* Animated top border on view */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: i * 0.09 + 0.2 }}
                className="absolute top-0 left-0 right-0 h-px origin-left"
                style={{ background: '#c8a951', opacity: 0.5 }}
              />
              {/* Hover fill */}
              <div className="absolute inset-0 bg-gold-100/0 group-hover:bg-gold-100/50 transition-colors duration-400" />
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.2, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className="relative z-10"
              >
                <item.icon size={16} strokeWidth={1.4} style={{ color: '#c8a951' }} />
              </motion.div>
              <div className="relative z-10">
                <h4 className="text-[8px] md:text-[10px] font-body font-semibold tracking-[0.08em] uppercase text-foreground leading-tight mb-0.5">
                  {item.label}
                </h4>
                <p className="text-[7px] md:text-[9px] font-body font-light text-muted leading-tight">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
