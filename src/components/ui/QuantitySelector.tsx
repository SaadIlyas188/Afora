'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-gold-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="p-2 hover:bg-gold-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <Minus size={14} className="text-gold-600" />
      </button>
      <span className="px-4 py-1.5 text-sm font-medium min-w-[40px] text-center select-none">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="p-2 hover:bg-gold-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <Plus size={14} className="text-gold-600" />
      </button>
    </div>
  );
}
