'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function AboutPage() {
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_settings').select('value').eq('key', 'about_text').single().then(({ data }) => {
      if (data) setAboutText(data.value);
    });
  }, []);

  const values = [
    { title: 'Natural Ingredients', desc: 'Every product uses pure, natural ingredients sourced with care.', bg: '#faf8f4', accent: '#c8a951' },
    { title: 'Dermatologist Tested', desc: 'All formulas are tested and approved for all skin types.', bg: '#f5ede0', accent: '#b8955a' },
    { title: 'Made with Love', desc: 'Each product is crafted with genuine passion for skincare.', bg: '#faf8f4', accent: '#c8a951' },
    { title: 'Visible Results', desc: 'See the difference in your skin within the first week.', bg: '#f5ede0', accent: '#b8955a' },
    { title: 'Transparent', desc: 'We list every single ingredient — no hidden chemicals.', bg: '#faf8f4', accent: '#c8a951' },
    { title: 'Premium Quality', desc: 'Luxury skincare without the luxury price tag.', bg: '#f5ede0', accent: '#b8955a' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="pt-10 pb-3 md:py-36 text-center px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4 md:mb-8">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">About Us</span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-light text-foreground tracking-wide mb-4">Our Story</h1>
          <p className="text-sm md:text-lg font-body text-muted font-light leading-relaxed">
            Born from a simple belief — that everyone deserves radiant, healthy skin without compromise.
          </p>
        </motion.div>
      </section>

      {/* Founder */}
      <AnimatedSection>
        <section className="max-w-3xl mx-auto px-6 md:px-12 pt-4 pb-8 md:py-20">
          <div
            className="border-t border-b border-gold-200/40 py-7 md:py-16 px-4 md:px-0"
            style={{ backgroundColor: 'rgba(245, 237, 224, 0.35)' }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: '#c8a951' }} />
              <span className="text-[9px] font-body tracking-[0.25em] uppercase" style={{ color: '#c8a951' }}>Founder</span>
              <div className="w-6 h-px" style={{ background: '#c8a951' }} />
            </div>
            <h2 className="text-2xl md:text-4xl font-heading font-light text-center mb-5 tracking-wide">Sidra Shahzad</h2>
            <div className="text-center space-y-4 font-body text-muted font-light leading-relaxed text-sm md:text-base">
              <p>
                Deeply passionate about skincare, after years of struggling with products full of hidden chemicals,
                I decided to create something different.
              </p>
              <p>
                AFORA is my love letter to clean beauty. Every product in our 6-step ritual is formulated with ingredients
                I trust and would use on my own skin. No fillers, no shortcuts, just results.
              </p>
              {aboutText && <p className="text-xs md:text-sm italic border-t border-gold-200/40 pt-5 mt-5">{aboutText}</p>}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection>
        <section className="max-w-[1000px] mx-auto px-6 md:px-12 py-8 md:py-20">
          <div className="flex items-center justify-center gap-4 mb-6 md:mb-12">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">What We Stand For</span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gold-200/40">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-4 md:p-8 text-center relative overflow-hidden"
                style={{ backgroundColor: v.bg }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: v.accent, opacity: 0.5 }} />
                <h3 className="text-[11px] md:text-sm font-heading font-medium mb-1.5 tracking-wide">{v.title}</h3>
                <p className="text-[10px] md:text-xs font-body font-light leading-relaxed" style={{ color: '#8a7a6a' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
