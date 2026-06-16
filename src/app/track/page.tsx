'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Check, Package, Truck, Home, Clock, XCircle, Search, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; ring: string; message: string }> = {
  pending:    { icon: Clock,    label: 'Order Placed',  color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   message: 'We\'ve received your order and it\'s awaiting confirmation.' },
  confirmed:  { icon: Check,    label: 'Confirmed',     color: 'text-sky-600',     bg: 'bg-sky-50',     ring: 'ring-sky-200',     message: 'Your order is confirmed and being prepared by our team.' },
  processing: { icon: Package,  label: 'Packing',       color: 'text-violet-600',  bg: 'bg-violet-50',  ring: 'ring-violet-200',  message: 'Your AFORA products are being carefully packed.' },
  shipped:    { icon: Truck,    label: 'On the Way',    color: 'text-indigo-600',  bg: 'bg-indigo-50',  ring: 'ring-indigo-200',  message: 'Your order is on its way! Expect delivery in 2–5 business days.' },
  delivered:  { icon: Home,     label: 'Delivered',     color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', message: 'Delivered! Enjoy your AFORA ritual.' },
  cancelled:  { icon: XCircle,  label: 'Cancelled',     color: 'text-red-500',     bg: 'bg-red-50',     ring: 'ring-red-200',     message: 'This order has been cancelled.' },
};

const TRACK_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

const STEP_LABELS: Record<string, string> = {
  pending: 'Placed', confirmed: 'Confirmed', processing: 'Packing', shipped: 'Shipped', delivered: 'Delivered',
};

export default function TrackOrderPage() {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courierStatus, setCourierStatus] = useState<{ label: string; status: string } | null>(null);

  const fetchCourierStatus = async (trackingNumber: string) => {
    try {
      const res = await fetch(`/api/barqraftar/track?tracking_number=${encodeURIComponent(trackingNumber)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCourierStatus({ label: data.status_label, status: data.status });
      }
    } catch {
      // Courier status fetch is best-effort
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setCourierStatus(null);

    try {
      const res = await fetch(`/api/track-order?order_number=${encodeURIComponent(orderNumber.trim())}`);
      const json = await res.json();
      if (res.ok && json.order) {
        setOrder(json.order);
        if (json.order.barqraftar_tracking_number) {
          fetchCourierStatus(json.order.barqraftar_tracking_number);
        }
      } else {
        setError('No order found with that number. Please check and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null;
  const currentStep = order ? TRACK_STEPS.indexOf(order.status as typeof TRACK_STEPS[number]) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-14">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold-300" />
            <span className="text-[10px] font-body tracking-[0.3em] uppercase text-muted">Delivery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-light tracking-wide text-foreground mb-2">Track Order</h1>
          <p className="text-sm font-body text-muted font-light">Enter your order number from your confirmation page (e.g. <span className="font-mono">AFORA-20260611-1234</span>).</p>
        </div>

        {/* Login nudge for guests */}
        {!user && (
          <div className="flex items-center gap-3 bg-gold-50 border border-gold-200/50 rounded-xl px-4 py-3 mb-6">
            <User size={16} className="text-gold-500 flex-shrink-0" />
            <p className="text-xs font-body text-foreground/80 flex-1">
              <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-2">Sign in</Link> to see all your orders in one place.
            </p>
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleTrack} className="mb-8">
          <label className="block text-[11px] font-body font-medium tracking-[0.15em] uppercase text-muted mb-2">Order Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AFORA-20260611-1234"
              className="flex-1 border border-gold-200/60 px-4 py-3 text-sm font-body focus:outline-none focus:border-foreground transition-colors rounded-none"
            />
            <Button type="submit" loading={loading} className="gap-2 px-5">
              <Search size={16} />
              <span className="hidden sm:inline">Track</span>
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500 font-body">{error}</p>
          )}
        </form>

        {/* Result */}
        <AnimatePresence mode="wait">
          {order && cfg && (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Status card */}
              <div className={`rounded-2xl p-5 ${cfg.bg} ring-1 ${cfg.ring}`}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <cfg.icon size={18} className={cfg.color} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body">Status</p>
                    <p className={`text-base font-heading font-light tracking-wide ${cfg.color}`}>{cfg.label}</p>
                  </div>
                  <p className="ml-auto text-[10px] font-mono text-muted">{order.order_number}</p>
                </div>
                <p className="text-xs font-body text-muted font-light mt-2 leading-relaxed">{cfg.message}</p>
              </div>

              {/* Courier tracking info */}
              {order.barqraftar_tracking_number && (
                <div className="bg-white border border-indigo-200/50 rounded-2xl p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-2">Courier Tracking</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-indigo-600">{order.barqraftar_tracking_number}</p>
                      {courierStatus && (
                        <p className="text-xs text-muted mt-0.5">Courier status: <span className="text-foreground font-medium">{courierStatus.label}</span></p>
                      )}
                    </div>
                    <span className="text-[9px] text-muted bg-indigo-50 px-2 py-0.5 rounded-full">BarqRaftar</span>
                  </div>
                </div>
              )}

              {/* Progress tracker */}
              {!isCancelled && (
                <div className="bg-white border border-gold-200/40 rounded-2xl p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-5">Order Progress</p>
                  {/* Horizontal stepper */}
                  <div className="relative">
                    {/* Line */}
                    <div className="absolute top-4 left-4 right-4 h-px bg-gold-100" />
                    <div
                      className="absolute top-4 left-4 h-px bg-foreground transition-all duration-700"
                      style={{
                        width: currentStep === -1 ? '0%' : `${(currentStep / (TRACK_STEPS.length - 1)) * (100 - (8 / TRACK_STEPS.length))}%`,
                      }}
                    />
                    <div className="relative flex justify-between">
                      {TRACK_STEPS.map((step, i) => {
                        const done = currentStep >= i;
                        const active = currentStep === i;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / TRACK_STEPS.length}%` }}>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                                done
                                  ? 'bg-foreground text-gold-50'
                                  : 'bg-white border-2 border-gold-200 text-muted'
                              } ${active ? 'ring-2 ring-offset-2 ring-foreground/20' : ''}`}
                            >
                              {done ? <Check size={13} strokeWidth={2.5} /> : <span className="text-[9px] font-medium">{i + 1}</span>}
                            </div>
                            <span className={`text-[9px] font-body text-center leading-tight ${done ? 'text-foreground font-medium' : 'text-muted'}`}>
                              {STEP_LABELS[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Order meta */}
              <div className="bg-white border border-gold-200/40 rounded-2xl p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-1">Date</p>
                  <p className="text-sm font-body text-foreground">{new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-1">Total</p>
                  <p className="text-sm font-body font-medium text-foreground">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-1">Name</p>
                  <p className="text-sm font-body text-foreground">{order.first_name} {order.last_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-1">Items</p>
                  <p className="text-sm font-body text-foreground">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-white border border-gold-200/40 rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-2">Delivery Address</p>
                <p className="text-sm font-body text-foreground leading-relaxed">{order.address}, {order.city}{order.postal_code ? ` ${order.postal_code}` : ''}</p>
                <p className="text-xs font-body text-muted mt-1">{order.phone}</p>
              </div>

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="bg-white border border-gold-200/40 rounded-2xl p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-body mb-3">Items Ordered</p>
                  <div className="space-y-2.5">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body text-foreground truncate">{item.product_name}</p>
                          <p className="text-xs text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-body font-medium text-foreground flex-shrink-0">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gold-100 flex justify-between">
                      <span className="text-xs text-muted font-body">Total</span>
                      <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Track another */}
              <button
                type="button"
                onClick={() => { setOrder(null); setOrderNumber(''); }}
                className="text-xs font-body text-muted hover:text-foreground transition-colors underline underline-offset-2 w-full text-center py-2"
              >
                Track another order
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
