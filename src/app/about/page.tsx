'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { Sparkles, Leaf, Heart, Shield, Eye, Star } from 'lucide-react';

export default function AboutPage() {
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_settings').select('value').eq('key', 'about_text').single().then(({ data }) => {
      if (data) setAboutText(data.value);
    });
  }, []);

  const values = [
    { icon: Leaf, title: 'Natural Ingredients', desc: 'Every product uses pure, natural ingredients sourced with care.' },
    { icon: Shield, title: 'Dermatologist Tested', desc: 'All formulas are tested and approved for all skin types.' },
    { icon: Heart, title: 'Made with Love', desc: 'Each product is crafted with genuine passion for skincare.' },
    { icon: Sparkles, title: 'Visible Results', desc: 'See the difference in your skin within the first week.' },
    { icon: Eye, title: 'Transparent', desc: 'We list every single ingredient — no hidden chemicals.' },
    { icon: Star, title: 'Premium Quality', desc: 'Luxury skincare without the luxury price tag.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-32 text-center px-4">
        <div className="absolute inset-0 gold-gradient-bg opacity-5" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 gold-gradient-text">Our Story</h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed">
            AFORA was born from a simple belief — that everyone deserves radiant, healthy skin without compromise.
          </p>
        </motion.div>
      </section>

      {/* Founder */}
      <AnimatedSection>
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-center">Meet the Founder</h2>
            <div className="prose prose-lg text-muted mx-auto text-center">
              <p className="mb-4">
                I&apos;m <span className="font-semibold text-gold-500">Sidra Shahzad</span> — just a woman deeply passionate about skincare. 
                After years of struggling with products full of hidden chemicals, I decided to create something different.
              </p>
              <p className="mb-4">
                AFORA is my love letter to clean beauty. Every product in our 6-step ritual is formulated with ingredients 
                I trust and would use on my own skin. No fillers, no shortcuts, just results.
              </p>
              {aboutText && <p className="text-sm italic border-t border-gold-100 pt-4 mt-4">{aboutText}</p>}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection>
        <section className="max-w-5xl mx-auto px-4 md:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-full gold-gradient-bg flex items-center justify-center mx-auto mb-4">
                  <v.icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
