'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { ShoppingBag, Trash2, User } from 'lucide-react';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { items: wishlistItems, localIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Determine which product IDs to fetch
    const productIds = user
      ? wishlistItems.map((w) => w.product_id)
      : localIds;

    if (productIds.length > 0) {
      const supabase = createClient();
      supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*)')
        .in('id', productIds)
        .then(({ data }) => {
          if (data) setProducts(data);
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [user, authLoading, wishlistItems, localIds]);

  const handleMoveToCart = (product: Product) => {
    const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
    addToCart({ id: product.id, type: 'product', name: product.name, price: product.price, image_url: primaryImage?.image_url ?? null, slug: product.slug });
    toggleWishlist(product.id, product.name);
  };

  if (authLoading || loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide font-heading">Wishlist</h1>
        {user && <Link href="/account"><Button variant="ghost" size="sm">← Account</Button></Link>}
      </div>

      {/* Guest login nudge */}
      {!user && (
        <div className="flex items-center gap-3 bg-gold-50 border border-gold-200/50 rounded-xl px-4 py-3 mb-6">
          <User size={16} className="text-gold-500 flex-shrink-0" />
          <p className="text-xs font-body text-foreground/80 flex-1">
            <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-2">Sign in</Link> to save your wishlist permanently across devices.
          </p>
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState type="wishlist" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, i) => {
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-gold-200/40 p-4 flex gap-4">
                <Link href={`/products/${product.slug}`} className="w-24 h-24 overflow-hidden bg-cream-100 flex-shrink-0">
                  <Image src={getImageUrl(primaryImage?.image_url ?? null)} alt={product.name} width={96} height={96} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug}`} className="font-medium text-sm hover:text-foreground block truncate">{product.name}</Link>
                  <p className="text-xs text-muted mb-1">{product.category?.name}</p>
                  <p className="text-sm font-medium text-foreground mb-3">{formatPrice(product.price)}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleMoveToCart(product)} className="gap-1 text-xs"><ShoppingBag size={12} /> Move to Cart</Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleWishlist(product.id, product.name)} className="text-red-400"><Trash2 size={14} /></Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
