'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';

const promises = [
  { label: 'Premium Ingredients', desc: 'Clinically proven' },
  { label: 'Dermatologist Approved', desc: 'Safe for all skin' },
  { label: 'Gentle Formula', desc: 'No harsh chemicals' },
  { label: 'Nationwide Delivery', desc: 'Across Pakistan' },
  { label: 'Crafted with Love', desc: 'Made in Pakistan' },
  { label: 'Satisfaction Guaranteed', desc: 'Visible results' },
];

export default function BrandPromise() {
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 border-t border-gold-200/40" style={{ background: 'linear-gradient(to bottom, #faf8f4, #f7f3eb)' }}>
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-6">
            {promises.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <h4 className="text-[10px] md:text-[11px] font-body font-medium tracking-[0.1em] uppercase text-foreground mb-1">{item.label}</h4>
                <p className="text-[9px] md:text-[10px] font-body font-light hidden md:block" style={{ color: '#c8a951' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
