'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check, Package, Truck, Home, Clock, XCircle, RefreshCw } from 'lucide-react';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; message: string }> = {
  pending:    { icon: Clock,    label: 'Pending',    color: 'text-yellow-600', bg: 'bg-yellow-50',  message: 'Your order has been received and is awaiting confirmation.' },
  confirmed:  { icon: Check,    label: 'Confirmed',  color: 'text-blue-600',   bg: 'bg-blue-50',    message: 'Your order has been confirmed and is being prepared.' },
  processing: { icon: Package,  label: 'Processing', color: 'text-purple-600', bg: 'bg-purple-50',  message: 'Your items are being packed and made ready for dispatch.' },
  shipped:    { icon: Truck,    label: 'Shipped',    color: 'text-indigo-600', bg: 'bg-indigo-50',  message: 'Your order is on its way! Expected delivery in 2-5 business days.' },
  delivered:  { icon: Home,     label: 'Delivered',  color: 'text-green-600',  bg: 'bg-green-50',   message: 'Your order has been delivered. Enjoy your AFORA products!' },
  cancelled:  { icon: XCircle,  label: 'Cancelled',  color: 'text-red-600',    bg: 'bg-red-50',     message: 'This order has been cancelled.' },
};

const TRACK_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [courierLabel, setCourierLabel] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrder(data);
          // Fetch live courier status if tracking number exists
          if (data.barqraftar_tracking_number) {
            fetch(`/api/barqraftar/track?tracking_number=${encodeURIComponent(data.barqraftar_tracking_number)}`)
              .then(r => r.json())
              .then(d => { if (d.success) setCourierLabel(d.status_label); })
              .catch(() => {});
          }
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-muted mb-4">Order not found.</p>
        <Link href="/account/orders"><Button variant="outline">Back to Orders</Button></Link>
      </div>
    </div>
  );

  const currentStatusIndex = TRACK_STEPS.indexOf(order.status as typeof TRACK_STEPS[number]);
  const isCancelled = order.status === 'cancelled';
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl md:text-2xl font-light tracking-wide font-heading">Order Details</h1>
        <Link href="/account/orders"><Button variant="ghost" size="sm">← Back</Button></Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Status Banner */}
        <div className={`p-5 md:p-6 ${cfg.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.color} bg-white shadow-sm flex-shrink-0`}>
              <cfg.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest font-medium">Current Status</p>
              <p className={`text-lg font-light tracking-wide font-heading capitalize ${cfg.color}`}>{cfg.label}</p>
            </div>
          </div>
          <p className="text-sm text-muted mt-1 pl-[52px]">{cfg.message}</p>
        </div>

        {/* Courier Tracking */}
        {order.barqraftar_tracking_number && (
          <div className="border border-indigo-200/50 bg-indigo-50/30 p-5 md:p-6">
            <h2 className="text-xs font-medium mb-2 uppercase tracking-widest text-muted">Courier Tracking</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-indigo-600">{order.barqraftar_tracking_number}</p>
                {courierLabel && (
                  <p className="text-xs text-muted mt-0.5">Courier status: <span className="text-foreground font-medium">{courierLabel}</span></p>
                )}
              </div>
              <span className="text-[9px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">BarqRaftar</span>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="border border-gold-200/40 p-5 md:p-6">
            <h2 className="text-xs font-medium mb-6 text-muted uppercase tracking-widest">Order Progress</h2>
            <div className="relative">
              {/* Background line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gold-100 z-0" />
              {/* Filled line */}
              <div
                className="absolute top-5 left-5 h-0.5 bg-foreground z-0 transition-all duration-700"
                style={{
                  width: currentStatusIndex <= 0
                    ? '0%'
                    : `${(currentStatusIndex / (TRACK_STEPS.length - 1)) * 100}%`
                }}
              />
              <div className="relative z-10 flex justify-between">
                {TRACK_STEPS.map((step, i) => {
                  const isCompleted = currentStatusIndex >= i;
                  const isCurrent = currentStatusIndex === i;
                  const StepIcon = STATUS_CONFIG[step].icon;
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 flex-1">
                      <motion.div
                        animate={{ scale: isCurrent ? 1.2 : 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted ? 'bg-foreground border-gold-300 shadow-md' : 'bg-white border-gold-200/40'
                        }`}
                      >
                        <StepIcon size={15} className={isCompleted ? 'text-gold-50' : 'text-gold-300'} />
                      </motion.div>
                      <span className={`text-[9px] md:text-xs capitalize text-center leading-tight ${
                        isCurrent ? 'font-bold text-foreground' : isCompleted ? 'font-medium text-foreground' : 'text-muted'
                      }`}>
                        {STATUS_CONFIG[step].label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Info & Items */}
        <div className="border border-gold-200/40 p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <p className="font-mono text-sm font-medium">{order.order_number}</p>
            <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="space-y-2 mb-4">
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

          <div className="space-y-1.5 text-sm pt-3 border-t border-gold-200/40">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span>{order.delivery_charges === 0 ? 'Free' : formatPrice(order.delivery_charges)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gold-200/40">
              <span>Total</span>
              <span className="text-foreground">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border border-gold-200/40 p-5 md:p-6">
          <h2 className="text-xs font-medium mb-3 uppercase tracking-widest text-muted">Shipping Address</h2>
          <p className="text-sm font-medium">{order.first_name} {order.last_name}</p>
          <p className="text-sm text-muted">{order.address}</p>
          <p className="text-sm text-muted">{order.city}{order.postal_code ? `, ${order.postal_code}` : ''}</p>
          <p className="text-sm text-muted mt-1">{order.phone}</p>
          <p className="text-sm text-muted">{order.email}</p>
        </div>

        {order.notes && (
          <div className="border border-gold-200/40 p-5 md:p-6">
            <h2 className="text-xs font-medium mb-2 uppercase tracking-widest text-muted">Order Notes</h2>
            <p className="text-sm text-muted">{order.notes}</p>
          </div>
        )}

        <Link href="/products">
          <Button variant="outline" className="w-full gap-2">
            <RefreshCw size={14} /> Continue Shopping
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
