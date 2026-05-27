'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SETTINGS_KEYS = [
  { key: 'contact_email', label: 'Contact Email', type: 'text' },
  { key: 'whatsapp', label: 'WhatsApp Number', type: 'text' },
  { key: 'instagram', label: 'Instagram Handle', type: 'text' },
  { key: 'facebook', label: 'Facebook URL', type: 'text' },
  { key: 'announcement_text', label: 'Announcement Bar Text', type: 'text' },
  { key: 'about_text', label: 'About Page Extra Text', type: 'textarea' },
];

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const s: Record<string, string> = {};
        data.forEach((d) => (s[d.key] = d.value));
        setSettings(s);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    toast.success('Settings saved!');
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Settings</h1>
        <Button onClick={handleSave} loading={saving}>Save All</Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted" /></div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gold-50 p-6 space-y-5">
        {SETTINGS_KEYS.map((s) => (
          s.type === 'textarea' ? (
            <Textarea key={s.key} label={s.label} value={settings[s.key] || ''} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} rows={3} />
          ) : (
            <Input key={s.key} label={s.label} value={settings[s.key] || ''} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} />
          )
        ))}
      </div>
      )}
    </div>
  );
}
