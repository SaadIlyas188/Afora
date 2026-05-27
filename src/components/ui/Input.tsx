'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm text-foreground',
            'placeholder:text-muted/60 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200/50',
            'transition-all duration-200',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-200/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm text-foreground',
            'placeholder:text-muted/60 focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200/50',
            'transition-all duration-200 resize-none',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-200/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm text-foreground',
            'focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200/50',
            'transition-all duration-200',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-200/50',
            className
          )}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
