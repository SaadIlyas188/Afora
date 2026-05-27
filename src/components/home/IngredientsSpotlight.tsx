'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ingredients = [
  {
    name: 'Niacinamide',
    aka: 'Vitamin B3',
    benefit: 'Evens skin tone, reduces pores, and strengthens the skin barrier',
    icon: '🔬',
  },
  {
    name: 'Hyaluronic Acid',
    aka: 'HA',
    benefit: 'Holds 1000x its weight in water for deep, lasting hydration',
    icon: '💧',
  },
  {
    name: 'Glycolic Acid',
    aka: 'AHA',
    benefit: 'Gently exfoliates to reveal brighter, smoother skin underneath',
    icon: '✨',
  },
  {
    name: 'Alpha Arbutin',
    aka: 'Brightener',
    benefit: 'Targets dark spots and hyperpigmentation for an even complexion',
    icon: '🌟',
  },
  {
    name: 'Shea Butter',
    aka: 'Emollient',
    benefit: 'Rich in vitamins A & E, deeply nourishes and softens dry skin',
    icon: '🧴',
  },
  {
    name: 'Aloe Vera',
    aka: 'Botanical',
    benefit: 'Soothes, calms irritation, and rejuvenates stressed skin naturally',
    icon: '🌿',
  },
];

export default function IngredientsSpotlight() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm tracking-[0.3em] text-gold-400 uppercase mb-3">
            Powered by Science
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-heading gold-gradient-text mb-4">
            Key Ingredients
          </h2>
          <p className="text-sm md:text-base text-muted max-w-lg mx-auto">
            Every AFORA product is formulated with clinically-proven ingredients that deliver real results.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={ingredient.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-4 md:p-6 text-center hover:shadow-md transition-shadow"
            >
              <span className="text-2xl md:text-3xl mb-3 block">{ingredient.icon}</span>
              <h3 className="text-sm md:text-base font-semibold font-heading mb-0.5">{ingredient.name}</h3>
              <p className="text-[10px] md:text-xs text-gold-400 mb-2">{ingredient.aka}</p>
              <p className="text-xs md:text-sm text-muted leading-relaxed">{ingredient.benefit}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
