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
    <footer className="bg-cream-100 border-t border-gold-100 mt-auto mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-[0.15em] gold-gradient-text font-heading">
                AFORA
              </span>
              <br />
              <span className="text-xs tracking-[0.1em] text-gold-400 italic">
                by Sidra Shahzad
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              A new era of luxury skincare. Experience the radiance you deserve.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Shop All', href: '/products' },
                { label: 'The Bundle', href: '/bundle' },
                { label: 'About Us', href: '/about' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-gold-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Customer Service</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Track Order', href: '/account/orders' },
                { label: 'Shipping Info', href: '/faq' },
                { label: 'Returns', href: '/faq' },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-gold-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Connect With Us</h4>
            <div className="flex gap-3 mb-4">
              {settings.instagram_username && (
                <a
                  href={`https://instagram.com/${settings.instagram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold-200 flex items-center justify-center hover:bg-gold-300 hover:text-white hover:border-gold-300 transition-all text-gold-400"
                >
                  <Camera size={16} />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold-200 flex items-center justify-center hover:bg-gold-300 hover:text-white hover:border-gold-300 transition-all text-gold-400"
                >
                  <Globe size={16} />
                </a>
              )}
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold-200 flex items-center justify-center hover:bg-gold-300 hover:text-white hover:border-gold-300 transition-all text-gold-400"
                >
                  <MessageCircle size={16} />
                </a>
              )}
              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="w-9 h-9 rounded-full border border-gold-200 flex items-center justify-center hover:bg-gold-300 hover:text-white hover:border-gold-300 transition-all text-gold-400"
                >
                  <Mail size={16} />
                </a>
              )}
            </div>
            <p className="text-xs text-muted">Lahore, Pakistan</p>
            <p className="text-xs text-muted">Delivering across Pakistan 🇵🇰</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gold-100 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} AFORA by Sidra Shahzad. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Cash on Delivery — Rs. 250 Standard Delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
