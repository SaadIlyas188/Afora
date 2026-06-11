'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { CartItem, AppliedPromo } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryCharges: number;
  freeDeliveryThreshold: number;
  discount: number;
  total: number;
  promoCode: AppliedPromo | null;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (promo: AppliedPromo) => void;
  removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<AppliedPromo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deliveryRate, setDeliveryRate] = useState(250);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(5000);

  useEffect(() => {
    const saved = localStorage.getItem('afora-cart');
    const savedPromo = localStorage.getItem('afora-promo');
    if (saved) setItems(JSON.parse(saved));
    if (savedPromo) setPromoCode(JSON.parse(savedPromo));
    setLoaded(true);

    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['delivery_charges', 'free_delivery_threshold'])
      .then(({ data }) => {
        if (data) {
          data.forEach((row) => {
            const num = parseFloat(row.value);
            if (!isNaN(num)) {
              if (row.key === 'delivery_charges') setDeliveryRate(num);
              if (row.key === 'free_delivery_threshold') setFreeDeliveryThreshold(num);
            }
          });
        }
      });
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('afora-cart', JSON.stringify(items));
    }
  }, [items, loaded]);

  useEffect(() => {
    if (loaded) {
      if (promoCode) {
        localStorage.setItem('afora-promo', JSON.stringify(promoCode));
      } else {
        localStorage.removeItem('afora-promo');
      }
    }
  }, [promoCode, loaded]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    toast.success(`${item.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item removed from cart');
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
  }, []);

  const applyPromo = useCallback((promo: AppliedPromo) => {
    setPromoCode(promo);
    toast.success(`Promo code "${promo.code}" applied!`);
  }, []);

  const removePromo = useCallback(() => {
    setPromoCode(null);
    toast.success('Promo code removed');
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharges = subtotal > 0 ? (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryRate) : 0;

  const discount = promoCode
    ? promoCode.discount_type === 'percentage'
      ? Math.round((subtotal * promoCode.discount_amount) / 100)
      : promoCode.discount_amount
    : 0;

  const total = Math.max(0, subtotal - discount + deliveryCharges);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        deliveryCharges,
        freeDeliveryThreshold,
        discount,
        total,
        promoCode,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
