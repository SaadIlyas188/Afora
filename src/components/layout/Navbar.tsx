'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/bundle', label: 'The Ritual' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, profile } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className={`hidden md:block sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-gold-50/90 backdrop-blur-xl border-b border-gold-200/40'
            : 'bg-gold-50'
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-8 lg:px-12">
          <div className="flex items-center justify-between h-[72px]">
            {/* Left: Nav Links */}
            <div className="flex items-center gap-10">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-body font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:text-foreground ${
                    pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
                      ? 'text-foreground'
                      : 'text-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex flex-col items-center group">
              <span className="text-[28px] font-heading font-semibold tracking-[0.25em] text-foreground transition-all duration-300">
                AFORA
              </span>
              <span className="text-[9px] font-heading tracking-[0.2em] text-muted -mt-1 font-light">
                by Sidra Shahzad
              </span>
            </Link>

            {/* Right: Nav Links + Icons */}
            <div className="flex items-center gap-10">
              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-body font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:text-foreground ${
                    pathname === link.href ? 'text-foreground' : 'text-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-5 ml-6">
                <Link href="/account/wishlist" className="relative hover:opacity-60 transition-opacity text-foreground">
                  <Heart size={18} strokeWidth={1.5} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-foreground text-gold-50 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative hover:opacity-60 transition-opacity text-foreground">
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1.5 bg-foreground text-gold-50 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Link>
                <Link
                  href={user ? '/account' : '/auth/login'}
                  className="hover:opacity-60 transition-opacity text-foreground"
                >
                  <User size={18} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header
        className={`md:hidden sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? 'bg-gold-50/90 backdrop-blur-xl border-b border-gold-200/40' : 'bg-gold-50'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1 cursor-pointer">
            <Menu size={20} strokeWidth={1.5} className="text-foreground" />
          </button>
          <Link href="/" className="flex flex-col items-center">
            <span className="text-lg font-heading font-semibold tracking-[0.25em] text-foreground">
              AFORA
            </span>
            <span className="text-[7px] font-heading tracking-[0.2em] text-muted -mt-0.5 font-light">
              by Sidra Shahzad
            </span>
          </Link>
          <Link href="/cart" className="relative p-1">
            <ShoppingBag size={18} strokeWidth={1.5} className="text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-foreground text-gold-50 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 w-[280px] bg-gold-50 z-50 md:hidden"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex flex-col">
                    <span className="text-xl font-heading font-semibold tracking-[0.25em] text-foreground">AFORA</span>
                    <span className="text-[8px] font-heading tracking-[0.2em] text-muted font-light">by Sidra Shahzad</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 cursor-pointer">
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <nav className="flex-1 space-y-1">
                  <Link
                    href="/"
                    className={`block py-3 text-[11px] font-body font-medium tracking-[0.15em] uppercase transition-all ${
                      pathname === '/' ? 'text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Home
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block py-3 text-[11px] font-body font-medium tracking-[0.15em] uppercase transition-all ${
                        pathname === link.href ? 'text-foreground' : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/faq"
                    className={`block py-3 text-[11px] font-body font-medium tracking-[0.15em] uppercase transition-all ${
                      pathname === '/faq' ? 'text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    FAQ
                  </Link>
                </nav>
                <div className="pt-6 border-t border-gold-200/50 space-y-1">
                  <Link
                    href={user ? '/account' : '/auth/login'}
                    className="flex items-center gap-3 py-3 text-[11px] font-body font-medium tracking-[0.15em] uppercase text-muted hover:text-foreground"
                  >
                    <User size={16} strokeWidth={1.5} />
                    {user ? 'My Account' : 'Sign In'}
                  </Link>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
