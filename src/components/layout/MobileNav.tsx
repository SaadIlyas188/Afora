'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Shop', icon: Search },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account', label: 'Account', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-gold-100 pb-safe">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          const showBadge =
            (tab.label === 'Cart' && totalItems > 0) ||
            (tab.label === 'Wishlist' && wishlistItems.length > 0);
          const badgeCount = tab.label === 'Cart' ? totalItems : wishlistItems.length;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold-300 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-gold-500' : 'text-foreground/40'}`}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 bg-gold-300 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-gold-500' : 'text-foreground/40'
                }`}
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
