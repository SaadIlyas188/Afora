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

  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_settings').select('key, value').in('key', ['contact_email', 'whatsapp', 'instagram', 'facebook']).then(({ data }) => {
      if (data) {
        const s: Record<string, string> = {};
        data.forEach((d) => (s[d.key] = d.value));
        setSettings(s);
      }
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
    <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold gold-gradient-text mb-3">Get in Touch</h1>
          <p className="text-muted">We&apos;d love to hear from you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <Textarea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} required />
              <Button type="submit" loading={loading} className="w-full" size="lg">Send Message</Button>
            </form>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-semibold mb-6">Connect With Us</h2>
              <div className="space-y-4">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gold-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center group-hover:gold-gradient-bg transition-all">
                      <s.icon size={18} className="text-gold-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.label}</p>
                      <p className="text-xs text-muted">{s.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-semibold mb-3">Shipping Info</h2>
              <p className="text-sm text-muted mb-2">Standard delivery: <span className="font-semibold text-gold-500">PKR 250</span></p>
              <p className="text-sm text-muted">Free delivery on orders above <span className="font-semibold text-gold-500">PKR 5,000</span></p>
              <p className="text-sm text-muted mt-3">Cash on Delivery only</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
