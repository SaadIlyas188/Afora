'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice, getImageUrl } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gold-200/20 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-cream-100">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
            {/* Step Badge */}
            {product.step_number && (
              <div className="absolute top-3 left-3 w-7 h-7 md:w-8 md:h-8 rounded-full gold-gradient-bg flex items-center justify-center">
                <span className="text-white text-xs font-bold">{product.step_number}</span>
              </div>
            )}
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white cursor-pointer"
            >
              <Heart
                size={16}
                className={`transition-all ${
                  inWishlist ? 'fill-red-400 text-red-400' : 'text-foreground/40'
                }`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="p-3 md:p-4 space-y-1.5 md:space-y-2">
            <p className="text-[10px] md:text-xs text-gold-400 uppercase tracking-wider font-medium">
              {product.category?.name || 'Skincare'}
            </p>
            <h3 className="text-sm md:text-base font-semibold text-foreground leading-tight line-clamp-1 font-heading">
              {product.name}
            </h3>
            <p className="text-xs md:text-sm text-muted line-clamp-2 leading-relaxed hidden md:block">
              {product.description}
            </p>

            {/* Rating */}
            {(product.average_rating ?? 0) > 0 && (
              <StarRating
                rating={product.average_rating || 0}
                size={12}
                showCount
                count={product.review_count || 0}
              />
            )}

            {/* Price + Cart */}
            <div className="flex items-center justify-between pt-1 md:pt-2">
              <span className="text-sm md:text-base font-semibold text-gold-600">
                {formatPrice(product.price)}
              </span>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-600 transition-colors text-xs md:text-sm font-medium cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span className="hidden md:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
