'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import type { Category } from '@/types';

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', short_description: '', how_to_use: '',
    price: '', compare_at_price: '', category_id: '', step_number: '',
    is_active: true, is_featured: true,
  });
  const [ingredients, setIngredients] = useState<{ name: string; description: string }[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    supabase.from('products').select('*, category:categories(name), images:product_images(*)').order('step_number').then(({ data }) => {
      if (data) setProducts(data);
      setLoading(false);
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
    setHighlights([]);
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
    supabase.from('product_ingredients').select('*').eq('product_id', p.id).order('sort_order').then(({ data }) => {
      setIngredients(data?.map((d: any) => ({ name: d.ingredient_name || d.name || '', description: d.ingredient_description || d.description || '' })) || []);
    });
    supabase.from('product_highlights').select('*').eq('product_id', p.id).order('sort_order').then(({ data }) => {
      setHighlights(data?.map((d: any) => d.text) || []);
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

    await supabase.from('product_ingredients').delete().eq('product_id', productId);
    if (ingredients.length > 0) {
      await supabase.from('product_ingredients').insert(
        ingredients.map((ing, i) => ({ product_id: productId, ingredient_name: ing.name, ingredient_description: ing.description, sort_order: i }))
      );
    }

    await supabase.from('product_highlights').delete().eq('product_id', productId);
    if (highlights.length > 0) {
      await supabase.from('product_highlights').insert(
        highlights.filter(t => t.trim()).map((text, i) => ({ product_id: productId, text: text.trim(), sort_order: i }))
      );
    }

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
          sort_order: (editing?.images?.length || 0) + imageFiles.indexOf(file),
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
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Products</h1>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> Add Product</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted" />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => {
              const img = p.images?.find((i: any) => i.is_primary) || p.images?.[0];
              return (
                <div key={p.id} className="bg-white border border-gold-200/40 p-4">
                  <div className="flex items-start gap-3">
                    {img
                      ? <Image src={img.image_url} alt="" width={56} height={56} className="w-14 h-14 object-cover flex-shrink-0" />
                      : <div className="w-14 h-14 bg-cream-100 flex items-center justify-center flex-shrink-0"><ImageIcon size={18} className="text-muted" /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm leading-tight">{p.name}</p>
                          <p className="text-xs text-muted mt-0.5">{p.category?.name || 'No category'}{p.step_number ? ` · Step ${p.step_number}` : ''}</p>
                          <p className="text-sm font-medium text-foreground mt-1">{formatPrice(p.price)}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(p)} className="p-2 hover:bg-gold-50 transition-colors cursor-pointer"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-400 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && <p className="text-muted text-sm text-center py-8">No products yet</p>}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gold-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-50 text-xs text-muted border-b border-gold-200/40">
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
                      <tr key={p.id} className="border-b border-gold-50 last:border-0 hover:bg-cream-50/50 transition-colors">
                        <td className="px-4 py-3">
                          {img ? <Image src={img.image_url} alt="" width={40} height={40} className="w-10 h-10 object-cover" /> : <div className="w-10 h-10 bg-cream-100 flex items-center justify-center"><ImageIcon size={14} className="text-muted" /></div>}
                        </td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-muted">{p.category?.name || '-'}</td>
                        <td className="px-4 py-3 text-muted">{p.step_number || '-'}</td>
                        <td className="px-4 py-3 text-right">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{p.is_active ? 'Active' : 'Off'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gold-50 cursor-pointer transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-red-400 cursor-pointer transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'New Product'} maxWidth="max-w-xl">
        <div className="space-y-5">

          {/* Basic Info */}
          <div>
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
            </div>
            <div className="mt-3">
              <Input label="Short Description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
          </div>

          <div className="h-px bg-gold-100" />

          {/* Pricing & Category */}
          <div>
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">Pricing & Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="Price (PKR) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <Input label="Compare Price" type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
              <Input label="Step #" type="number" value={form.step_number} onChange={(e) => setForm({ ...form, step_number: e.target.value })} />
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-body font-medium tracking-[0.1em] uppercase text-foreground/70 mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border border-gold-200/40 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8a951] rounded-lg transition-colors">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-gold-100" />

          {/* Status Toggles */}
          <div>
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">Status</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full border border-gold-200 bg-gold-50 peer-checked:bg-[#c8a951] peer-checked:border-[#c8a951] transition-all" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-body text-foreground/80">Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full border border-gold-200 bg-gold-50 peer-checked:bg-[#c8a951] peer-checked:border-[#c8a951] transition-all" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-body text-foreground/80">Featured</span>
              </label>
            </div>
          </div>

          <div className="h-px bg-gold-100" />

          {/* Description */}
          <div>
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-body font-medium tracking-[0.1em] uppercase text-foreground/70 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gold-200/40 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8a951] resize-none rounded-lg transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-body font-medium tracking-[0.1em] uppercase text-foreground/70 mb-1.5">How to Use</label>
                <textarea value={form.how_to_use} onChange={(e) => setForm({ ...form, how_to_use: e.target.value })} rows={3} className="w-full border border-gold-200/40 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#c8a951] resize-none rounded-lg transition-colors" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gold-100" />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500">Key Ingredients</p>
              <button type="button" onClick={() => setIngredients([...ingredients, { name: '', description: '' }])} className="text-xs text-[#c8a951] font-medium hover:underline cursor-pointer">+ Add</button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input value={ing.name} onChange={(e) => { const n = [...ingredients]; n[i].name = e.target.value; setIngredients(n); }} placeholder="Ingredient name" className="w-full sm:flex-1 border border-gold-200/40 px-3 py-2 text-sm focus:outline-none focus:border-[#c8a951] rounded-lg" />
                  <input value={ing.description} onChange={(e) => { const n = [...ingredients]; n[i].description = e.target.value; setIngredients(n); }} placeholder="Benefit" className="w-full sm:flex-1 border border-gold-200/40 px-3 py-2 text-sm focus:outline-none focus:border-[#c8a951] rounded-lg" />
                  <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="self-end sm:self-auto w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400 cursor-pointer text-lg leading-none flex-shrink-0">&times;</button>
                </div>
              ))}
              {ingredients.length === 0 && <p className="text-xs text-muted py-1">No key ingredients added</p>}
            </div>
          </div>

          <div className="h-px bg-gold-100" />

          {/* Highlights */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500">Highlights</p>
              <button type="button" onClick={() => setHighlights([...highlights, ''])} className="text-xs text-[#c8a951] font-medium hover:underline cursor-pointer">+ Add</button>
            </div>
            <div className="space-y-2">
              {highlights.map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rotate-45 flex-shrink-0 inline-block" />
                  <input
                    value={text}
                    onChange={(e) => { const n = [...highlights]; n[i] = e.target.value; setHighlights(n); }}
                    placeholder="e.g. Fragrance-free formula"
                    className="flex-1 border border-gold-200/40 px-3 py-2 text-sm focus:outline-none focus:border-[#c8a951] rounded-lg"
                  />
                  <button onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400 cursor-pointer text-lg leading-none flex-shrink-0">&times;</button>
                </div>
              ))}
              {highlights.length === 0 && <p className="text-xs text-muted py-1">No highlights added</p>}
            </div>
          </div>

          <div className="h-px bg-gold-100" />

          {/* Images */}
          <div>
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-gold-500 mb-3">Images</p>
            {editing?.images?.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {editing.images.map((img: any) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden">
                    <Image src={img.image_url} alt="" width={56} height={56} className="w-14 h-14 object-cover" />
                    <button onClick={async () => {
                      await supabase.from('product_images').delete().eq('id', img.id);
                      setEditing({ ...editing, images: editing.images.filter((i: any) => i.id !== img.id) });
                      toast.success('Image removed');
                    }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">&times;</button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gold-200 rounded-xl cursor-pointer hover:border-[#c8a951] transition-colors bg-gold-50/30">
              <Upload size={16} className="text-muted" />
              <span className="text-sm text-muted">{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Upload images'}</span>
              <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="hidden" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
