'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0, pendingOrders: 0, todayOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      supabase.from('orders').select('id, total, status, created_at'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
    ]).then(([ordersRes, usersRes, productsRes]) => {
      const orders = ordersRes.data || [];
      const rev = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
      const pending = orders.filter(o => o.status === 'pending').length;
      const todayO = orders.filter(o => o.created_at.startsWith(today)).length;
      setStats({
        totalOrders: orders.length,
        totalRevenue: rev,
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        pendingOrders: pending,
        todayOrders: todayO,
      });
      setLoading(false);
    });

    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5).then(({ data }) => {
      if (data) setRecentOrders(data);
    });
  }, []);

  const cards = [
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(stats.totalRevenue) },
    { icon: ShoppingCart, label: 'Total Orders', value: stats.totalOrders },
    { icon: Clock, label: 'Pending Orders', value: stats.pendingOrders },
    { icon: TrendingUp, label: 'Today\'s Orders', value: stats.todayOrders },
    { icon: Users, label: 'Customers', value: stats.totalUsers },
    { icon: Package, label: 'Products', value: stats.totalProducts },
  ];

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wide font-heading mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-4 md:p-5 shadow-sm border border-gold-50 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-50" />
                  <div className="space-y-2">
                    <div className="h-2.5 w-20 rounded bg-gold-50" />
                    <div className="h-4 w-16 rounded bg-gold-100" />
                  </div>
                </div>
              </div>
            ))
          : cards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-4 md:p-5 shadow-sm border border-gold-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center text-foreground/60">
                    <card.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{card.label}</p>
                    <p className="text-lg font-semibold text-foreground">{card.value}</p>
                  </div>
                </div>
              </motion.div>
            ))
        }
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-sm border border-gold-50 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gold-50">
          <h2 className="font-medium">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs text-muted">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gold-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                  <td className="px-4 py-3">{order.first_name} {order.last_name}</td>
                  <td className="px-4 py-3"><span className="capitalize text-xs font-medium">{order.status}</span></td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
