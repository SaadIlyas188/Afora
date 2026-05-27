'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPromosPage() {
  const supabase = createClient();
  const [promos, setPromos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = () => { setLoading(true); supabase.from('promo_codes').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setPromos(data); setLoading(false); }); };
  useEffect(fetch, []);

  const openNew = () => { setEditing(null); setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true }); setShowModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ code: p.code, discount_type: p.discount_type, discount_value: p.discount_value.toString(), min_order_amount: p.min_order_amount?.toString() || '', max_uses: p.max_uses?.toString() || '', expires_at: p.expires_at?.split('T')[0] || '', is_active: p.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      code: form.code.toUpperCase(), discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null, is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from('promo_codes').update(data).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('Updated!');
    } else {
      const { error } = await supabase.from('promo_codes').insert(data);
      if (error) toast.error(error.message); else toast.success('Created!');
    }
    setShowModal(false); fetch(); setSaving(false);
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('promo_codes').delete().eq('id', id); toast.success('Deleted'); fetch(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Promo Codes</h1>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> Add</Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted" /></div>
      ) : (
      <>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {promos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gold-50 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono font-medium text-sm">{p.code}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {p.discount_type === 'percentage' ? `${p.discount_value}% off` : `PKR ${p.discount_value} off`}
                    {p.min_order_amount ? ` · min PKR ${p.min_order_amount}` : ''}
                  </p>
                  <p className="text-xs text-muted">{p.used_count || 0}/{p.max_uses || '∞'} uses{p.expires_at ? ` · exp ${new Date(p.expires_at).toLocaleDateString()}` : ''}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge color={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'On' : 'Off'}</Badge>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gold-50"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {promos.length === 0 && <p className="text-sm text-muted text-center py-8">No promo codes</p>}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gold-50 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs text-muted">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Min Order</th>
              <th className="text-left px-4 py-3">Uses</th>
              <th className="text-left px-4 py-3">Expires</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-b border-gold-50 last:border-0">
                <td className="px-4 py-3 font-mono font-medium">{p.code}</td>
                <td className="px-4 py-3">{p.discount_type === 'percentage' ? `${p.discount_value}%` : `PKR ${p.discount_value}`}</td>
                <td className="px-4 py-3 text-muted">{p.min_order_amount ? `PKR ${p.min_order_amount}` : '-'}</td>
                <td className="px-4 py-3 text-muted">{p.used_count || 0}/{p.max_uses || '∞'}</td>
                <td className="px-4 py-3 text-xs text-muted">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-center"><Badge color={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gold-50"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Promo' : 'New Promo'}>
        <div className="space-y-4">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-lg border border-gold-200 px-4 py-2.5 text-sm">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <Input label="Value" type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Min Order (PKR)" type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
            <Input label="Max Uses" type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
          </div>
          <Input label="Expires At" type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
