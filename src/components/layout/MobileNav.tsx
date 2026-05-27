'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Package, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Shop', icon: Search },
  { href: '/bundle', label: 'Bundles', icon: Package },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/account', label: 'Account', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gold-50/95 backdrop-blur-xl border-t border-gold-200/40 pb-safe">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          const showBadge = tab.label === 'Cart' && totalItems > 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: '#c8a951' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="transition-colors"
                  style={{ color: active ? '#c8a951' : 'rgb(var(--muted) / 0.5)' }}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 bg-foreground text-gold-50 text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </div>
              <span
                className="text-[9px] font-body font-medium tracking-[0.05em] transition-colors"
                style={{ color: active ? '#c8a951' : 'rgb(var(--muted) / 0.5)' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
