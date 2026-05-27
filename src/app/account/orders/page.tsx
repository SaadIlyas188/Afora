'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';
import { formatPrice, getStatusColor } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setOrders(data);
          setLoading(false);
        });
    }
  }, [user, authLoading, router]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || o.order_number?.toLowerCase().includes(q) ||
        o.first_name?.toLowerCase().includes(q) ||
        o.items?.some((i: any) => i.product_name?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const handleOrderAgain = (order: Order) => {
    order.items?.forEach((item) => {
      addToCart({
        id: item.product_id || item.bundle_id || item.id,
        type: item.bundle_id ? 'bundle' : 'product',
        name: item.product_name,
        price: item.unit_price,
        image_url: null,
        slug: '',
      }, item.quantity);
    });
    toast.success('Items added to cart!');
    router.push('/cart');
  };

  if (authLoading || loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide font-heading">My Orders</h1>
        <Link href="/account"><Button variant="ghost" size="sm">← Back</Button></Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or product…"
            className="w-full border border-gold-200/60 pl-9 pr-9 py-2.5 text-sm font-body focus:outline-none focus:border-foreground transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        {/* Status pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-body font-medium tracking-[0.12em] uppercase whitespace-nowrap border transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-foreground text-gold-50 border-foreground'
                  : 'border-gold-200/60 text-muted hover:border-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? `All (${orders.length})` : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        orders.length === 0 ? (
          <EmptyState type="orders" />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted text-sm">No orders match your search.</p>
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-xs text-foreground underline mt-2">Clear filters</button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.04 }}
                className="border border-gold-200/40 p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-mono text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-foreground">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted truncate mr-4">{item.product_name} × {item.quantity}</span>
                      <span className="flex-shrink-0">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleOrderAgain(order)} className="gap-1.5">
                    <RefreshCw size={14} /> Order Again
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
