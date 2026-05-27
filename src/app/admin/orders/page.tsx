'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getStatusColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = () => {
    let q = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    q.then(({ data }) => { if (data) setOrders(data); });
  };
  useEffect(fetchOrders, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order marked as ${status}`);
    fetchOrders();
    if (selected?.id === orderId) setSelected({ ...selected, status });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-gold-200 px-3 py-2 text-sm">
          <option value="all">All</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gold-50 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs text-muted">
            <tr>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gold-50 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-3">{o.first_name} {o.last_name}</td>
                <td className="px-4 py-3 text-muted">{o.city}</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(o.status)}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(o)} className="p-1.5 rounded hover:bg-gold-50"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.order_number || ''}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-muted text-xs">Customer</p><p className="font-medium">{selected.first_name} {selected.last_name}</p></div>
              <div><p className="text-muted text-xs">Phone</p><p>{selected.phone}</p></div>
              <div><p className="text-muted text-xs">Email</p><p>{selected.email}</p></div>
              <div><p className="text-muted text-xs">City</p><p>{selected.city}</p></div>
              <div className="col-span-2"><p className="text-muted text-xs">Address</p><p>{selected.address}, {selected.postal_code}</p></div>
            </div>
            <div className="border-t border-gold-100 pt-3">
              <p className="font-medium mb-2">Items</p>
              {selected.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatPrice(item.total_price)}</span>
                </div>
              ))}
              <div className="border-t border-gold-100 mt-2 pt-2 space-y-1">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                {selected.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(selected.discount_amount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{selected.delivery_charges === 0 ? 'Free' : formatPrice(selected.delivery_charges)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t border-gold-100"><span>Total</span><span className="text-gold-600">{formatPrice(selected.total)}</span></div>
              </div>
            </div>
            {selected.notes && <div className="border-t border-gold-100 pt-3"><p className="text-muted text-xs">Notes</p><p>{selected.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
