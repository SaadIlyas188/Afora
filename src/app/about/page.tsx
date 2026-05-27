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
    { title: 'Natural Ingredients', desc: 'Every product uses pure, natural ingredients sourced with care.' },
    { title: 'Dermatologist Tested', desc: 'All formulas are tested and approved for all skin types.' },
    { title: 'Made with Love', desc: 'Each product is crafted with genuine passion for skincare.' },
    { title: 'Visible Results', desc: 'See the difference in your skin within the first week.' },
    { title: 'Transparent', desc: 'We list every single ingredient — no hidden chemicals.' },
    { title: 'Premium Quality', desc: 'Luxury skincare without the luxury price tag.' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="py-24 md:py-36 text-center px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">About Us</span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-light text-foreground tracking-wide mb-6">Our Story</h1>
          <p className="text-base md:text-lg font-body text-muted font-light leading-relaxed">
            Born from a simple belief — that everyone deserves radiant, healthy skin without compromise.
          </p>
        </motion.div>
      </section>

      {/* Founder */}
      <AnimatedSection>
        <section className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="border-t border-b border-gold-200/40 py-12 md:py-16">
            <h2 className="text-2xl md:text-4xl font-heading font-light text-center mb-8 tracking-wide">The Founder</h2>
            <div className="text-center space-y-5 font-body text-muted font-light leading-relaxed">
              <p>
                I&apos;m <span className="text-foreground font-medium">Sidra Shahzad</span> — deeply passionate about skincare. 
                After years of struggling with products full of hidden chemicals, I decided to create something different.
              </p>
              <p>
                AFORA is my love letter to clean beauty. Every product in our 6-step ritual is formulated with ingredients 
                I trust and would use on my own skin. No fillers, no shortcuts, just results.
              </p>
              {aboutText && <p className="text-sm italic border-t border-gold-200/40 pt-6 mt-6">{aboutText}</p>}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection>
        <section className="max-w-[1000px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="flex items-center justify-center gap-4 mb-12">
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
                className="bg-gold-50 p-6 md:p-8 text-center"
              >
                <h3 className="text-sm font-heading font-medium mb-2 tracking-wide">{v.title}</h3>
                <p className="text-xs font-body text-muted font-light">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
