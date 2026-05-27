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
    <div className="min-h-screen max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold gold-gradient-text mb-3">Frequently Asked Questions</h1>
          <p className="text-muted">Everything you need to know about AFORA</p>
        </div>

        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold font-heading mb-4 text-gold-500">{category}</h2>
              <Accordion items={items.map((faq) => ({ title: faq.question, content: faq.answer }))} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
