'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = () => { setLoading(true); supabase.from('categories').select('*').order('name').then(({ data }) => { if (data) setCategories(data); setLoading(false); }); };
  useEffect(fetch, []);

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', description: '', is_active: true }); setShowModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', is_active: c.is_active }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const data = { ...form, slug };
    if (editing) {
      const { error } = await supabase.from('categories').update(data).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('Updated!');
    } else {
      const { error } = await supabase.from('categories').insert(data);
      if (error) toast.error(error.message); else toast.success('Created!');
    }
    setShowModal(false); fetch(); setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Categories</h1>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> Add</Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted" /></div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gold-50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs text-muted">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Slug</th><th className="text-center px-4 py-3">Active</th><th className="text-right px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-gold-50 last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted">{c.slug}</td>
                <td className="px-4 py-3 text-center">{c.is_active ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gold-50"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
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
