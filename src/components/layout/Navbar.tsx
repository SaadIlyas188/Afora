'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/bundle', label: 'Bundle' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
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
        className={`hidden md:block sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm'
            : 'bg-cream-50'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Nav Links */}
            <div className="flex items-center gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-gold-500 ${
                    pathname === link.href ? 'text-gold-500' : 'text-foreground/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex flex-col items-center">
              <span className="text-2xl lg:text-3xl font-bold tracking-[0.2em] gold-gradient-text font-heading">
                AFORA
              </span>
              <span className="text-[10px] tracking-[0.15em] text-gold-400 -mt-1 italic">
                by Sidra Shahzad
              </span>
            </Link>

            {/* Right: Nav Links + Icons */}
            <div className="flex items-center gap-8">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-gold-500 ${
                    pathname === link.href ? 'text-gold-500' : 'text-foreground/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 ml-4 border-l border-gold-100 pl-4">
                <Link href="/account/wishlist" className="relative hover:text-gold-500 transition-colors text-foreground/70">
                  <Heart size={20} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gold-300 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative hover:text-gold-500 transition-colors text-foreground/70">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-gold-300 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Link>
                <Link
                  href={user ? (profile?.role === 'admin' ? '/admin' : '/account') : '/auth/login'}
                  className="hover:text-gold-500 transition-colors text-foreground/70"
                >
                  <User size={20} />
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header
        className={`md:hidden sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-cream-50/95 backdrop-blur-md shadow-sm' : 'bg-cream-50'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setMobileMenuOpen(true)} className="p-1 cursor-pointer">
            <Menu size={22} className="text-foreground/70" />
          </button>
          <Link href="/" className="flex flex-col items-center">
            <span className="text-lg font-bold tracking-[0.2em] gold-gradient-text font-heading">
              AFORA
            </span>
            <span className="text-[8px] tracking-[0.1em] text-gold-400 -mt-0.5 italic">
              by Sidra Shahzad
            </span>
          </Link>
          <Link href="/cart" className="relative p-1">
            <ShoppingBag size={20} className="text-foreground/70" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold-300 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
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
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-cream-50 z-50 md:hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-bold tracking-[0.15em] gold-gradient-text font-heading">AFORA</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 cursor-pointer">
                    <X size={22} />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        pathname === link.href
                          ? 'bg-gold-50 text-gold-600'
                          : 'text-foreground/70 hover:bg-gold-50/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 pt-6 border-t border-gold-100">
                  <Link
                    href={user ? '/account' : '/auth/login'}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-gold-50/50 rounded-lg"
                  >
                    <User size={18} />
                    {user ? 'My Account' : 'Sign In'}
                  </Link>
                  {user && profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gold-600 hover:bg-gold-50/50 rounded-lg"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
