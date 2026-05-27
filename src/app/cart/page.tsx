'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import QuantitySelector from '@/components/ui/QuantitySelector';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, subtotal, deliveryCharges, discount, total, promoCode, removeFromCart, updateQuantity, applyPromo, removePromo } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoInput.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (!data) {
      toast.error('Invalid or expired promo code');
    } else if (data.min_order_amount > subtotal) {
      toast.error(`Minimum order amount is ${formatPrice(data.min_order_amount)}`);
    } else if (data.usage_limit && data.times_used >= data.usage_limit) {
      toast.error('This promo code has reached its usage limit');
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error('This promo code has expired');
    } else {
      applyPromo({
        code: data.code,
        discount_amount: data.discount_amount,
        discount_type: data.discount_type,
      });
      setPromoInput('');
    }
    setApplyingPromo(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState type="cart" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-12 pb-20 md:pb-12">
      <h1 className="text-2xl md:text-4xl font-heading font-light tracking-wide mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="border border-gold-200/40 p-4 flex gap-4"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden bg-cream-200 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={item.type === 'bundle' ? '/bundle' : `/products/${item.slug}`} className="font-medium text-sm md:text-base font-heading hover:text-muted transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted capitalize font-body">{item.type}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted hover:text-red-400 transition-colors p-1 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <QuantitySelector quantity={item.quantity} onChange={(q) => updateQuantity(item.id, q)} />
                    <p className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gold-200/40 p-6 sticky top-24">
            <h2 className="text-lg font-heading font-light tracking-wide mb-4">Order Summary</h2>

            {/* Promo Code */}
            {promoCode ? (
              <div className="flex items-center justify-between bg-gold-50 p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-foreground">{promoCode.code}</span>
                </div>
                <button onClick={removePromo} className="text-muted hover:text-red-400 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  className="flex-1 border border-gold-200/40 px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground"
                />
                <Button onClick={handleApplyPromo} loading={applyingPromo} size="sm" variant="outline">
                  Apply
                </Button>
              </div>
            )}

            <div className="space-y-3 text-sm border-t border-gold-200/40 pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>{deliveryCharges === 0 ? <span className="text-green-600">Free</span> : formatPrice(deliveryCharges)}</span>
              </div>
              {deliveryCharges > 0 && subtotal < 5000 && (
                <p className="text-xs text-muted font-body font-light">Add {formatPrice(5000 - subtotal)} more for free delivery</p>
              )}
              <div className="flex justify-between font-medium text-base border-t border-gold-200/40 pt-3">
                <span>Total</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link href="/checkout" className="block">
                <Button className="w-full gap-2" size="lg">
                  <ShoppingBag size={18} />
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/products" className="block text-center text-sm text-muted hover:text-foreground transition-colors">
                Continue Shopping
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-gold-200/40">
              <p className="text-xs text-muted text-center font-body font-light">Cash on Delivery Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
