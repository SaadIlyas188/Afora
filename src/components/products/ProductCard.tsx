'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, getImageUrl } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const imageUrl = getImageUrl(primaryImage?.image_url ?? null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      image_url: primaryImage?.image_url ?? null,
      slug: product.slug,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-cream-200 mb-4">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            {/* Step Badge */}
            {product.step_number && (
              <div className="absolute top-3 left-3 text-[10px] font-body font-medium tracking-[0.15em] text-muted bg-gold-50/90 backdrop-blur-sm px-2 py-0.5">
                Step {product.step_number}
              </div>
            )}
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all cursor-pointer opacity-100"
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                className={`transition-all ${
                  inWishlist ? 'fill-foreground text-foreground' : 'text-foreground/50 hover:text-foreground'
                }`}
              />
            </button>
            {/* Quick Add */}
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm text-gold-50 py-3 text-[10px] font-body font-medium tracking-[0.2em] uppercase text-center cursor-pointer translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            >
              Add to Cart
            </button>
          </div>

          {/* Info */}
          <div className="space-y-1">
            <p className="text-[10px] font-body tracking-[0.15em] uppercase text-muted">
              {product.category?.name || 'Skincare'}
            </p>
            <h3 className="text-sm md:text-base font-heading font-medium text-foreground leading-tight tracking-wide">
              {product.name}
            </h3>
            <p className="text-sm font-body text-muted">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
