'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFAQsPage() {
  const supabase = createClient();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General', sort_order: '0', is_active: true });
  const [saving, setSaving] = useState(false);

  const fetch = () => { supabase.from('faqs').select('*').order('sort_order').then(({ data }) => { if (data) setFaqs(data); }); };
  useEffect(fetch, []);

  const openNew = () => { setEditing(null); setForm({ question: '', answer: '', category: 'General', sort_order: '0', is_active: true }); setShowModal(true); };
  const openEdit = (f: any) => { setEditing(f); setForm({ question: f.question, answer: f.answer, category: f.category || 'General', sort_order: f.sort_order.toString(), is_active: f.is_active }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, sort_order: parseInt(form.sort_order) };
    if (editing) {
      const { error } = await supabase.from('faqs').update(data).eq('id', editing.id);
      if (error) toast.error(error.message); else toast.success('Updated!');
    } else {
      const { error } = await supabase.from('faqs').insert(data);
      if (error) toast.error(error.message); else toast.success('Created!');
    }
    setShowModal(false); fetch(); setSaving(false);
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('faqs').delete().eq('id', id); toast.success('Deleted'); fetch(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">FAQs</h1>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> Add</Button>
      </div>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-50 flex items-start justify-between">
            <div>
              <span className="text-xs text-gold-400 font-medium">{f.category}</span>
              <p className="font-medium text-sm">{f.question}</p>
              <p className="text-xs text-muted mt-1 line-clamp-2">{f.answer}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(f)} className="p-1.5 rounded hover:bg-gold-50"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit FAQ' : 'New FAQ'}>
        <div className="space-y-4">
          <Input label="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
          <Textarea label="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
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
