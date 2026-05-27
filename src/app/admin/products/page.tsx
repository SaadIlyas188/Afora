'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import type { Product, Category } from '@/types';

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', short_description: '', how_to_use: '',
    price: '', compare_at_price: '', category_id: '', step_number: '',
    is_active: true, is_featured: true,
  });
  const [ingredients, setIngredients] = useState<{ name: string; description: string }[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    supabase.from('products').select('*, category:categories(name), images:product_images(*)').order('step_number').then(({ data }) => {
      if (data) setProducts(data);
    });
  };

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('name').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', short_description: '', how_to_use: '', price: '', compare_at_price: '', category_id: '', step_number: '', is_active: true, is_featured: true });
    setIngredients([]);
    setImageFiles([]);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', short_description: p.short_description || '', how_to_use: p.how_to_use || '',
      price: p.price.toString(), compare_at_price: p.compare_at_price?.toString() || '', category_id: p.category_id, step_number: p.step_number?.toString() || '',
      is_active: p.is_active, is_featured: p.is_featured,
    });
    // Load ingredients
    supabase.from('product_ingredients').select('*').eq('product_id', p.id).order('sort_order').then(({ data }) => {
      setIngredients(data?.map(d => ({ name: d.name, description: d.description || '' })) || []);
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const productData = {
      name: form.name, slug, description: form.description, short_description: form.short_description,
      how_to_use: form.how_to_use, price: parseFloat(form.price), compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      category_id: form.category_id || null, step_number: form.step_number ? parseInt(form.step_number) : null,
      is_active: form.is_active, is_featured: form.is_featured,
    };

    let productId = editing?.id;
    if (editing) {
      const { error } = await supabase.from('products').update(productData).eq('id', productId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('products').insert(productData).select('id').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      productId = data.id;
    }

    // Save ingredients
    await supabase.from('product_ingredients').delete().eq('product_id', productId);
    if (ingredients.length > 0) {
      await supabase.from('product_ingredients').insert(
        ingredients.map((ing, i) => ({ product_id: productId, name: ing.name, description: ing.description, sort_order: i }))
      );
    }

    // Upload images
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('product-images').upload(path, file);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          is_primary: (editing?.images?.length || 0) === 0 && imageFiles.indexOf(file) === 0,
        });
      }
    }

    toast.success(editing ? 'Product updated!' : 'Product created!');
    setShowModal(false);
    fetchProducts();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product deleted');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Products</h1>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> Add Product</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gold-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs text-muted">
              <tr>
                <th className="text-left px-4 py-3">Image</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Step</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-center px-4 py-3">Active</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images?.find((i: any) => i.is_primary) || p.images?.[0];
                return (
                  <tr key={p.id} className="border-b border-gold-50 last:border-0">
                    <td className="px-4 py-3">
                      {img ? <Image src={img.image_url} alt="" width={40} height={40} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-cream-100 flex items-center justify-center"><ImageIcon size={14} className="text-muted" /></div>}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-muted">{p.step_number || '-'}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-center">{p.is_active ? '✓' : '✗'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gold-50"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price (PKR)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Compare Price" type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
            <Input label="Step #" type="number" value={form.step_number} onChange={(e) => setForm({ ...form, step_number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm">
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Short Description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">How to Use</label>
            <textarea value={form.how_to_use} onChange={(e) => setForm({ ...form, how_to_use: e.target.value })} rows={3} className="w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /> Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" /> Featured
            </label>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Ingredients</label>
              <button type="button" onClick={() => setIngredients([...ingredients, { name: '', description: '' }])} className="text-xs text-gold-500 hover:underline">+ Add</button>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={ing.name} onChange={(e) => { const n = [...ingredients]; n[i].name = e.target.value; setIngredients(n); }} placeholder="Name" className="flex-1 rounded border border-gold-200 px-3 py-1.5 text-sm" />
                <input value={ing.description} onChange={(e) => { const n = [...ingredients]; n[i].description = e.target.value; setIngredients(n); }} placeholder="Benefit" className="flex-1 rounded border border-gold-200 px-3 py-1.5 text-sm" />
                <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-red-400 text-xs">✗</button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium block mb-2">Images</label>
            {editing?.images?.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {editing.images.map((img: any) => (
                  <div key={img.id} className="relative group">
                    <Image src={img.image_url} alt="" width={60} height={60} className="w-15 h-15 rounded object-cover" />
                    <button onClick={async () => {
                      await supabase.from('product_images').delete().eq('id', img.id);
                      setEditing({ ...editing, images: editing.images.filter((i: any) => i.id !== img.id) });
                      toast.success('Image removed');
                    }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100">✗</button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gold-200 rounded-lg cursor-pointer hover:border-gold-400 transition-colors">
              <Upload size={16} className="text-muted" />
              <span className="text-sm text-muted">{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Upload images'}</span>
              <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gold-100">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
