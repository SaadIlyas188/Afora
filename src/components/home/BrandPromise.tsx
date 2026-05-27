'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import { Sparkles, Truck, Shield, Heart, Leaf, Award } from 'lucide-react';

const promises = [
  { icon: Sparkles, label: 'Premium Ingredients', desc: 'Clinically proven formulas' },
  { icon: Shield, label: 'Dermatologist Approved', desc: 'Safe for all skin types' },
  { icon: Leaf, label: 'Gentle Formula', desc: 'No harsh chemicals' },
  { icon: Truck, label: 'Nationwide Delivery', desc: 'Across Pakistan' },
  { icon: Heart, label: 'Crafted with Love', desc: 'Made in Pakistan' },
  { icon: Award, label: 'Satisfaction Guaranteed', desc: 'Results you can see' },
];

export default function BrandPromise() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-8 bg-white border-t border-b border-gold-50">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
            {promises.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold-50 flex items-center justify-center mb-2 md:mb-3">
                    <Icon size={20} className="text-gold-400" />
                  </div>
                  <h4 className="text-[10px] md:text-xs font-semibold mb-0.5">{item.label}</h4>
                  <p className="text-[9px] md:text-[10px] text-muted hidden md:block">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
