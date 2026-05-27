'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { items: wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return; }
    if (wishlistItems.length > 0) {
      const supabase = createClient();
      const productIds = wishlistItems.map((w) => w.product_id);
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
  }, [user, authLoading, wishlistItems, router]);

  const handleMoveToCart = (product: Product) => {
    const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
    addToCart({ id: product.id, type: 'product', name: product.name, price: product.price, image_url: primaryImage?.image_url ?? null, slug: product.slug });
    toggleWishlist(product.id, product.name);
  };

  if (authLoading || loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">My Wishlist</h1>
        <Link href="/account"><Button variant="ghost" size="sm">← Back</Button></Link>
      </div>

      {products.length === 0 ? (
        <EmptyState type="wishlist" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, i) => {
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-4 flex gap-4">
                <Link href={`/products/${product.slug}`} className="w-24 h-24 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                  <Image src={getImageUrl(primaryImage?.image_url ?? null)} alt={product.name} width={96} height={96} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${product.slug}`} className="font-semibold text-sm hover:text-gold-500">{product.name}</Link>
                  <p className="text-xs text-gold-400 mb-1">{product.category?.name}</p>
                  <p className="text-sm font-semibold text-gold-600 mb-3">{formatPrice(product.price)}</p>
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
