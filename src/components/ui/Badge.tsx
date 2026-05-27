'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'gray';
  color?: 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'gray';
  className?: string;
}

export default function Badge({ children, variant, color, className }: BadgeProps) {
  const v = variant || color || 'gold';
  const variants = {
    gold: 'bg-gold-100 text-gold-700 border-gold-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[v],
        className
      )}
    >
      {children}
    </span>
  );
}
