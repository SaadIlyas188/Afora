'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FAQ } from '@/types';
import Accordion from '@/components/ui/Accordion';
import { motion } from 'framer-motion';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('faqs').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setFaqs(data);
    });
  }, []);

  // Group by category
  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <section className="py-20 md:py-28 text-center px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">Support</span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-light text-foreground tracking-wide mb-4">FAQ</h1>
          <p className="text-sm md:text-base font-body text-muted font-light">Everything you need to know about AFORA</p>
        </motion.div>
      </section>

      <div className="max-w-[700px] mx-auto px-6 md:px-12 pb-16">
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-muted mb-5 pb-3 border-b border-gold-200/40">{category}</h2>
              <Accordion items={items.map((faq) => ({ title: faq.question, content: faq.answer }))} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
