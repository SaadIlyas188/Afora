'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data);
      });
  }, [id]);

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2">Order Confirmed!</h1>
        <p className="text-muted mb-6">
          Thank you for your order. We&apos;ll send you an email confirmation shortly.
        </p>

        <div className="glass-card rounded-xl p-6 text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-gold-400" />
            <h2 className="font-semibold">Order Details</h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Order Number</span>
              <span className="font-mono font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className="text-gold-500 capitalize font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment</span>
              <span>Cash on Delivery</span>
            </div>

            <div className="border-t border-gold-100 pt-3 mt-3 space-y-1">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gold-100 pt-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>{order.delivery_charges === 0 ? 'Free' : formatPrice(order.delivery_charges)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gold-100">
                <span>Total</span>
                <span className="text-gold-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gold-100 text-sm">
            <p className="text-muted">Delivering to:</p>
            <p className="font-medium">{order.first_name} {order.last_name}</p>
            <p className="text-muted">{order.address}, {order.city} {order.postal_code}</p>
            <p className="text-muted">{order.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button className="gap-2 w-full sm:w-auto">
              Continue Shopping
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" className="w-full sm:w-auto">
              View Orders
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
