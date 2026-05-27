'use client';

import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ price, compareAtPrice, size = 'md' }: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold text-gold-600 ${sizeClasses[size]}`}>
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-muted line-through text-sm">
          {formatPrice(compareAtPrice)}
        </span>
      )}
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          Save {formatPrice(compareAtPrice - price)}
        </span>
      )}
    </div>
  );
}
