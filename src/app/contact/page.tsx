'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendContactEmail } from '@/lib/email';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Phone, MessageCircle, Camera, Globe } from 'lucide-react';

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_settings').select('key, value').in('key', ['contact_email', 'whatsapp', 'instagram', 'facebook']).then(({ data }) => {
      if (data) {
        const s: Record<string, string> = {};
        data.forEach((d) => (s[d.key] = d.value));
        setSettings(s);
      }
      setSettingsLoaded(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendContactEmail({ from_name: form.name, from_email: form.email, subject: form.subject, message: form.message, to_email: settings.contact_email || '' });
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const socials = [
    { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp, href: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}` : null },
    { icon: Camera, label: 'Instagram', value: settings.instagram, href: settings.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : null },
    { icon: Globe, label: 'Facebook', value: settings.facebook, href: settings.facebook || null },
    { icon: Mail, label: 'Email', value: settings.contact_email, href: settings.contact_email ? `mailto:${settings.contact_email}` : null },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <section className="py-20 md:py-28 text-center px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] md:text-[11px] font-body tracking-[0.3em] uppercase text-muted">Contact</span>
            <div className="w-8 h-px bg-gold-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-light text-foreground tracking-wide mb-4">Get in Touch</h1>
          <p className="text-sm md:text-base font-body text-muted font-light">We would love to hear from you</p>
        </motion.div>
      </section>

      <div className="max-w-[1000px] mx-auto px-6 md:px-12 pb-16">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-muted mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <Textarea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} required />
              <Button type="submit" loading={loading} className="w-full" size="lg">Send Message</Button>
            </form>
          </div>

          {/* Social Links + Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-muted mb-6">Connect With Us</h2>
              {!settingsLoaded ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border border-gold-200/40 animate-pulse">
                      <div className="w-4 h-4 rounded bg-gold-100" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 rounded bg-gold-100" />
                        <div className="h-2.5 w-32 rounded bg-gold-50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 border border-gold-200/40 hover:border-gold-300 transition-colors group"
                    >
                      <s.icon size={16} strokeWidth={1.5} className="text-muted group-hover:text-foreground transition-colors" />
                      <div>
                        <p className="text-sm font-body font-medium">{s.label}</p>
                        <p className="text-xs font-body text-muted font-light">{s.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gold-200/40 pt-8">
              <h2 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-muted mb-4">Shipping Info</h2>
              <div className="space-y-2">
                <p className="text-sm font-body text-muted font-light">Standard delivery: <span className="text-foreground font-medium">PKR 250</span></p>
                <p className="text-sm font-body text-muted font-light">Free delivery on orders above <span className="text-foreground font-medium">PKR 5,000</span></p>
                <p className="text-sm font-body text-muted font-light mt-3">Cash on Delivery only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
