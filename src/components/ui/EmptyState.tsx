'use client';

import { ShoppingBag, Heart, Package, Search } from 'lucide-react';
import Link from 'next/link';
import Button from './Button';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'orders' | 'search' | 'reviews';
  title?: string;
  description?: string;
}

const configs = {
  cart: {
    icon: ShoppingBag,
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added anything to your cart yet. Explore our collection to find your perfect skincare ritual.',
    cta: { label: 'Start Shopping', href: '/products' },
  },
  wishlist: {
    icon: Heart,
    title: 'Your wishlist is empty',
    description: 'Save your favorite products here for easy access later.',
    cta: { label: 'Browse Products', href: '/products' },
  },
  orders: {
    icon: Package,
    title: 'No orders yet',
    description: 'When you place your first order, it will appear here.',
    cta: { label: 'Shop Now', href: '/products' },
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'We couldn\'t find what you\'re looking for. Try a different search term.',
    cta: { label: 'View All Products', href: '/products' },
  },
  reviews: {
    icon: Search,
    title: 'No reviews yet',
    description: 'Be the first to share your experience with this product.',
    cta: null,
  },
};

export default function EmptyState({ type, title, description }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gold-50 flex items-center justify-center mb-6">
        <Icon size={32} className="text-gold-300" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title || config.title}</h3>
      <p className="text-muted text-sm max-w-md mb-6">{description || config.description}</p>
      {config.cta && (
        <Link href={config.cta.href}>
          <Button>{config.cta.label}</Button>
        </Link>
      )}
    </div>
  );
}
