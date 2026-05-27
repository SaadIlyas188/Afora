'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AnnouncementBar() {
  const [text, setText] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_bar_text')
      .single()
      .then(({ data }) => {
        if (data?.value) setText(data.value);
      });
  }, []);

  if (!text) return null;

  return (
    <div className="gold-gradient-bg text-white text-center py-2 px-4 text-xs md:text-sm font-medium tracking-wide">
      <p>{text}</p>
    </div>
  );
}
