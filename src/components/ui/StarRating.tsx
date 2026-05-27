'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  readonly: readonlyProp,
  onChange,
  showCount = false,
  count = 0,
}: StarRatingProps) {
  // readonly=true means interactive=false
  const isInteractive = readonlyProp !== undefined ? !readonlyProp : interactive;
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const filled = isInteractive
          ? starValue <= (hoverRating || rating)
          : starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!isInteractive}
            className={`${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
            onClick={() => isInteractive && onChange?.(starValue)}
            onMouseEnter={() => isInteractive && setHoverRating(starValue)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
          >
            <Star
              size={size}
              className={`transition-colors duration-150 ${
                filled
                  ? 'fill-gold-300 text-gold-300'
                  : 'fill-none text-gold-200'
              }`}
            />
          </button>
        );
      })}
      {showCount && (
        <span className="text-xs text-muted ml-1">({count})</span>
      )}
    </div>
  );
}
