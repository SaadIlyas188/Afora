'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBundlesPage() {
  const supabase = createClient();
  const [bundles, setBundles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', compare_at_price: '', is_active: true });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBundles = () => {
    setLoading(true);
    supabase.from('bundles').select('*, bundle_products(product_id)').order('created_at', { ascending: false }).then(({ data }) => { if (data) setBundles(data); setLoading(false); });
  };

  useEffect(() => {
    fetchBundles();
    supabase.from('products').select('id, name').order('step_number').then(({ data }) => { if (data) setProducts(data); });
  }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', description: '', price: '', compare_at_price: '', is_active: true }); setSelectedProducts([]); setShowModal(true); };
  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug, description: b.description || '', price: b.price.toString(), compare_at_price: b.compare_at_price?.toString() || '', is_active: b.is_active });
    setSelectedProducts(b.bundle_products?.map((bp: any) => bp.product_id) || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const data = { name: form.name, slug, description: form.description, price: parseFloat(form.price), compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null, is_active: form.is_active };

    let bundleId = editing?.id;
    if (editing) {
      const { error } = await supabase.from('bundles').update(data).eq('id', bundleId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data: d, error } = await supabase.from('bundles').insert(data).select('id').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      bundleId = d.id;
    }

    await supabase.from('bundle_products').delete().eq('bundle_id', bundleId);
    if (selectedProducts.length > 0) {
      await supabase.from('bundle_products').insert(selectedProducts.map(pid => ({ bundle_id: bundleId, product_id: pid })));
    }

    toast.success(editing ? 'Updated!' : 'Created!');
    setShowModal(false); fetchBundles(); setSaving(false);
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('bundles').delete().eq('id', id); toast.success('Deleted'); fetchBundles(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Bundles</h1>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> Add</Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted" /></div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gold-50 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs text-muted">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Products</th>
              <th className="text-center px-4 py-3">Active</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b.id} className="border-b border-gold-50 last:border-0">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-right">{formatPrice(b.price)}</td>
                <td className="px-4 py-3 text-muted">{b.bundle_products?.length || 0} products</td>
                <td className="px-4 py-3 text-center">{b.is_active ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-gold-50"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Bundle' : 'New Bundle'}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Price (PKR)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Compare Price" type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div>
            <label className="block text-sm font-medium mb-2">Products in Bundle</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={(e) => {
                    if (e.target.checked) setSelectedProducts([...selectedProducts, p.id]);
                    else setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                  }} />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
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
