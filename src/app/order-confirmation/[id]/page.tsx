'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const orderId = Array.isArray(id) ? id[0] : id;

    // Try sessionStorage first — works for guests and freshly placed orders
    const cached = sessionStorage.getItem(`afora-order-${orderId}`);
    if (cached) {
      try {
        setOrder(JSON.parse(cached));
        return;
      } catch {
        // fall through to Supabase
      }
    }

    // Fallback: Supabase (works for logged-in users revisiting the page)
    const supabase = createClient();
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setOrder(data);
        } else {
          console.error('Order fetch error:', error);
          setFailed(true);
        }
      });
  }, [id]);

  if (failed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted text-sm">We couldn&apos;t load your order details, but your order was placed successfully.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-8"
        >
          <Check size={28} strokeWidth={2.5} className="text-green-500" />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-heading font-light tracking-wide mb-2">
          Thank You for Your Order
        </h1>
        <p className="text-sm text-muted mb-8">
          We&apos;ve received your order and will get it to you soon.
        </p>

        <div className="border border-gold-200/40 p-5 text-left mb-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Order</span>
            <span className="font-mono font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total</span>
            <span className="font-medium">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Payment</span>
            <span>Cash on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Delivering to</span>
            <span className="text-right">{order.city}</span>
          </div>
        </div>

        <p className="text-xs text-muted mb-8">
          Use your order number <span className="font-mono text-foreground">{order.order_number}</span> to track your order at{' '}
          <Link href="/track" className="underline underline-offset-2 hover:text-foreground transition-colors">/track</Link>
        </p>

        <Link href="/">
          <Button className="w-full sm:w-auto px-10">
            Continue Shopping
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
