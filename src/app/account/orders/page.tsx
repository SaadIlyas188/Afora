'use client';

import { useEffect, useState } from 'react';
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
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">My Orders</h1>
        <Link href="/account"><Button variant="ghost" size="sm">← Back</Button></Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState type="orders" />
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono text-sm font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gold-600">{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted">{item.product_name} × {item.quantity}</span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleOrderAgain(order)} className="gap-1.5">
                  <RefreshCw size={14} /> Order Again
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
