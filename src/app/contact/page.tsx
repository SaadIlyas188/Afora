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
      {/* Header — compact on mobile, spacious on desktop */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-7 pb-5 px-5 border-b border-gold-200/40 md:border-none md:py-28 md:text-center md:px-12"
      >
        <p className="text-[9px] font-body tracking-[0.28em] uppercase text-muted mb-1 md:hidden">Contact</p>
        <h1 className="text-[1.65rem] md:text-6xl font-heading font-light text-foreground tracking-wide md:mb-4">Get in Touch</h1>
        <div className="hidden md:flex items-center justify-center gap-4 mb-8 mt-4">
          <div className="w-8 h-px bg-gold-300" />
          <span className="text-[10px] font-body tracking-[0.3em] uppercase text-muted">Contact</span>
          <div className="w-8 h-px bg-gold-300" />
        </div>
        <p className="hidden md:block text-base font-body text-muted font-light">We would love to hear from you</p>
      </motion.section>

      <div className="max-w-[1000px] mx-auto px-5 md:px-12 pt-5 pb-10 md:pt-0 md:pb-16">
        {/* Mobile-only: socials grid + shipping strip */}
        <div className="md:hidden mb-5">
          {!settingsLoaded ? (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gold-100/50 rounded-none animate-pulse" />
              ))}
            </div>
          ) : socials.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 border border-gold-200/50 bg-gold-50/60 hover:border-gold-400/70 transition-colors"
                >
                  <s.icon size={13} strokeWidth={1.5} style={{ color: '#c8a951' }} />
                  <span className="text-[11px] font-body font-medium tracking-wide">{s.label}</span>
                </a>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-body text-muted pt-2.5 border-t border-gold-200/30">
            <span>Delivery: <span className="text-foreground font-medium">PKR 250</span></span>
            <span className="text-gold-400/50">·</span>
            <span>Free above <span className="text-foreground font-medium">PKR 5,000</span></span>
            <span className="text-gold-400/50">·</span>
            <span>Cash on Delivery</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-muted mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-5">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <Textarea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required />
              <Button type="submit" loading={loading} className="w-full" size="lg">Send Message</Button>
            </form>
          </div>

          {/* Social Links + Info — desktop only */}
          <div className="hidden md:block space-y-10">
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
