'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getStatusColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Eye, Loader2, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sendingBR, setSendingBR] = useState<string | null>(null);
  const [refreshingBR, setRefreshingBR] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    let q = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    q.then(({ data }) => { if (data) setOrders(data); setLoading(false); });
  };
  useEffect(fetchOrders, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order marked as ${status}`);
    fetchOrders();
    if (selected?.id === orderId) setSelected({ ...selected, status });
  };

  const sendToBarqRaftar = async (orderId: string) => {
    setSendingBR(orderId);
    try {
      const res = await fetch('/api/barqraftar/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Sent! Tracking: ${data.tracking_number}`);
        fetchOrders();
        if (selected?.id === orderId) {
          setSelected({ ...selected, barqraftar_tracking_number: data.tracking_number, barqraftar_status: 'pending' });
        }
      } else {
        toast.error(data.error || 'Failed to send to BarqRaftar');
      }
    } catch {
      toast.error('Failed to send to BarqRaftar');
    }
    setSendingBR(null);
  };

  const refreshBarqRaftarStatus = async (trackingNumber: string) => {
    setRefreshingBR(true);
    try {
      const res = await fetch(`/api/barqraftar/track?tracking_number=${encodeURIComponent(trackingNumber)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state and DB
        const brStatus = data.status;
        const mappedStatus = data.mapped_status;
        await supabase
          .from('orders')
          .update({ barqraftar_status: brStatus, status: mappedStatus })
          .eq('barqraftar_tracking_number', trackingNumber);
        toast.success(`Courier: ${data.status_label}`);
        fetchOrders();
        if (selected?.barqraftar_tracking_number === trackingNumber) {
          setSelected({ ...selected, barqraftar_status: brStatus, status: mappedStatus });
        }
      } else {
        toast.error(data.error || 'Could not fetch tracking');
      }
    } catch {
      toast.error('Failed to refresh status');
    }
    setRefreshingBR(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gold-200/40 px-3 py-2 text-sm focus:outline-none bg-white">
          <option value="all">All</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted" />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white border border-gold-200/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-muted">{o.order_number}</p>
                    <p className="font-medium text-sm mt-0.5">{o.first_name} {o.last_name}</p>
                    <p className="text-xs text-muted">{o.city}</p>
                    {o.barqraftar_tracking_number && (
                      <p className="text-[10px] font-mono text-indigo-600 mt-0.5">BR: {o.barqraftar_tracking_number}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={`text-xs font-medium px-2 py-1 border-0 outline-none ${getStatusColor(o.status)}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="text-sm font-medium">{formatPrice(o.total)}</span>
                    </div>
                    {!o.barqraftar_tracking_number && (
                      <button
                        onClick={() => sendToBarqRaftar(o.id)}
                        disabled={sendingBR === o.id}
                        className="mt-2 text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                      >
                        {sendingBR === o.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                        Send to Courier
                      </button>
                    )}
                  </div>
                  <button onClick={() => setSelected(o)} className="p-2 hover:bg-gold-50 transition-colors cursor-pointer flex-shrink-0">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-muted text-sm text-center py-8">No orders yet</p>}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gold-200/40 overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs text-muted border-b border-gold-200/40">
            <tr>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Tracking</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
                <tr key={o.id} className="border-b border-gold-50 last:border-0 hover:bg-cream-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-3">{o.first_name} {o.last_name}</td>
                <td className="px-4 py-3 text-muted">{o.city}</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={`text-xs font-medium px-2 py-1 border-0 outline-none ${getStatusColor(o.status)}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {o.barqraftar_tracking_number ? (
                    <span className="font-mono text-xs text-indigo-600">{o.barqraftar_tracking_number}</span>
                  ) : (
                    <button
                      onClick={() => sendToBarqRaftar(o.id)}
                      disabled={sendingBR === o.id}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      {sendingBR === o.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                      Send
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(o)} className="p-1.5 hover:bg-gold-50 cursor-pointer transition-colors"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
            </table>
          </div>
        </>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.order_number || ''}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            {/* BarqRaftar Courier Info */}
            <div className="bg-indigo-50 border border-indigo-100 p-3 space-y-2">
              <p className="text-xs font-medium text-indigo-800">Courier (BarqRaftar)</p>
              {selected.barqraftar_tracking_number ? (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm text-indigo-700">{selected.barqraftar_tracking_number}</p>
                    {selected.barqraftar_status && (
                      <p className="text-xs text-indigo-600 capitalize mt-0.5">Status: {selected.barqraftar_status}</p>
                    )}
                  </div>
                  <button
                    onClick={() => refreshBarqRaftarStatus(selected.barqraftar_tracking_number)}
                    disabled={refreshingBR}
                    className="p-1.5 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={`text-indigo-600 ${refreshingBR ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => sendToBarqRaftar(selected.id)}
                  disabled={sendingBR === selected.id}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {sendingBR === selected.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Send to BarqRaftar
                </button>
              )}
            </div>

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
