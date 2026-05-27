'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';
import { formatPrice, getStatusColor, getStatusMessage, ORDER_STATUSES } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single().then(({ data }) => {
      if (data) setOrder(data);
    });
  }, [id]);

  if (!order) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" /></div>;

  const statusIndex = ORDER_STATUSES.indexOf(order.status as (typeof ORDER_STATUSES)[number]);
  const trackableStatuses = ORDER_STATUSES.filter(s => s !== 'cancelled');

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-heading">Order Details</h1>
        <Link href="/account/orders"><Button variant="ghost" size="sm">← Back</Button></Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Status */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-sm font-medium">{order.order_number}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
          </div>
          <p className="text-sm text-muted mb-6">{getStatusMessage(order.status)}</p>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="flex items-center justify-between">
              {trackableStatuses.map((status, i) => {
                const isCompleted = i <= statusIndex;
                const isCurrent = i === statusIndex;
                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${isCompleted ? 'gold-gradient-bg' : 'bg-gray-100'}`}>
                      {isCompleted ? <Check size={14} className="text-white" /> : <Circle size={14} className="text-gray-300" />}
                    </div>
                    <span className={`text-[9px] md:text-xs capitalize ${isCurrent ? 'font-semibold text-gold-500' : 'text-muted'}`}>{status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gold-50 last:border-0">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                </div>
                <p className="font-medium">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gold-100 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{order.delivery_charges === 0 ? 'Free' : formatPrice(order.delivery_charges)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gold-100"><span>Total</span><span className="text-gold-600">{formatPrice(order.total)}</span></div>
          </div>
        </div>

        {/* Shipping */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <p className="text-sm">{order.first_name} {order.last_name}</p>
          <p className="text-sm text-muted">{order.address}</p>
          <p className="text-sm text-muted">{order.city}, {order.postal_code}</p>
          <p className="text-sm text-muted">{order.phone}</p>
          <p className="text-sm text-muted">{order.email}</p>
        </div>
      </motion.div>
    </div>
  );
}
