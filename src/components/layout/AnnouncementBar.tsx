'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AnnouncementBar() {
  const [text, setText] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_text')
      .single()
      .then(({ data }) => {
        if (data?.value) setText(data.value);
      });
  }, []);

  if (!text || pathname?.startsWith('/admin')) return null;

  return (
    <div className="bg-foreground text-gold-50 text-center py-2.5 px-4">
      <p className="text-[10px] md:text-[11px] font-body font-light tracking-[0.15em] uppercase">{text}</p>
    </div>
  );
}
