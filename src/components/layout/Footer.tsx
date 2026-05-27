'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Globe, MessageCircle, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteSettings } from '@/types';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (data) {
          const s: Record<string, string> = {};
          data.forEach((row) => (s[row.key] = row.value));
          setSettings(s as unknown as Partial<SiteSettings>);
        }
      });
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-foreground text-gold-50 mt-auto mb-16 md:mb-0">
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 py-8 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 mb-2 md:mb-0">
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl md:text-2xl font-heading font-light tracking-[0.25em] text-gold-50">
                AFORA
              </span>
              <br />
              <span className="text-[9px] font-heading tracking-[0.2em] text-gold-500 font-light">
                by Sidra Shahzad
              </span>
            </Link>
            <p className="text-xs md:text-sm text-gold-400 leading-relaxed font-body font-light">
              A new era of luxury skincare.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-gold-300 mb-3 md:mb-5">Quick Links</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: 'Shop All', href: '/products' },
                { label: 'The Ritual', href: '/bundle' },
                { label: 'About', href: '/about' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs md:text-sm font-body text-gold-400 hover:text-gold-50 transition-colors font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-gold-300 mb-3 md:mb-5">Help</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Track Order', href: '/account/orders' },
                { label: 'Shipping Info', href: '/faq' },
                { label: 'Returns', href: '/faq' },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-xs md:text-sm font-body text-gold-400 hover:text-gold-50 transition-colors font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-gold-300 mb-5">Connect</h4>
            <div className="flex gap-3 mb-5">
              {settings.instagram && (
                <a href={`https://instagram.com/${(settings.instagram as string).replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-gold-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-50 transition-all text-gold-500">
                  <Camera size={14} strokeWidth={1.5} />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook as string} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-gold-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-50 transition-all text-gold-500">
                  <Globe size={14} strokeWidth={1.5} />
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${(settings.whatsapp as string).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-gold-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-50 transition-all text-gold-500">
                  <MessageCircle size={14} strokeWidth={1.5} />
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="w-8 h-8 border border-gold-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-50 transition-all text-gold-500">
                  <Mail size={14} strokeWidth={1.5} />
                </a>
              )}
            </div>
            <p className="text-xs font-body text-gold-500 font-light">Lahore, Pakistan</p>
          </div>
        </div>

        <div className="mt-8 md:mt-14 pt-5 border-t border-gold-800 flex flex-col md:flex-row justify-between items-center gap-1.5">
          <p className="text-[10px] font-body text-gold-600 tracking-wide">
            &copy; {new Date().getFullYear()} AFORA by Sidra Shahzad
          </p>
          <p className="text-[10px] font-body text-gold-600 tracking-wide">
            Cash on Delivery — Rs. 250 Delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
