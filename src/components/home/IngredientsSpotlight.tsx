'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ingredients = [
  {
    name: 'Niacinamide',
    aka: 'Vitamin B3',
    benefit: 'Evens skin tone, reduces pores, and strengthens the skin barrier',
  },
  {
    name: 'Hyaluronic Acid',
    aka: 'HA',
    benefit: 'Holds 1000x its weight in water for deep, lasting hydration',
  },
  {
    name: 'Glycolic Acid',
    aka: 'AHA',
    benefit: 'Gently exfoliates to reveal brighter, smoother skin underneath',
  },
  {
    name: 'Alpha Arbutin',
    aka: 'Brightener',
    benefit: 'Targets dark spots and hyperpigmentation for an even complexion',
  },
  {
    name: 'Shea Butter',
    aka: 'Emollient',
    benefit: 'Rich in vitamins A & E, deeply nourishes and softens dry skin',
  },
  {
    name: 'Aloe Vera',
    aka: 'Botanical',
    benefit: 'Soothes, calms irritation, and rejuvenates stressed skin naturally',
  },
];

export default function IngredientsSpotlight() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 md:py-32 px-6 md:px-12" style={{ backgroundColor: '#f7f3eb' }}>
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">
              Powered by Science
            </span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-light text-foreground tracking-wide mb-4">
            Key Ingredients
          </h2>
          <p className="text-sm md:text-base font-body text-muted max-w-md mx-auto font-light">
            Clinically-proven ingredients that deliver real results.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gold-200/40">
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={ingredient.name}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-gold-50 p-6 md:p-10 group hover:bg-cream-200/50 transition-colors duration-500"
            >
              <p className="text-[10px] font-body tracking-[0.2em] uppercase mb-3" style={{ color: '#c8a951' }}>{ingredient.aka}</p>
              <h3 className="text-lg md:text-xl font-heading font-medium text-foreground mb-3 tracking-wide">{ingredient.name}</h3>
              <p className="text-xs md:text-sm font-body text-muted leading-relaxed font-light">{ingredient.benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
