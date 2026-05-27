'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { Check, X, Loader2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    let q = supabase.from('reviews').select('*, product:products(name), profile:profiles(first_name, last_name)').order('created_at', { ascending: false });
    if (filter === 'pending') q = q.eq('is_approved', false);
    if (filter === 'approved') q = q.eq('is_approved', true);
    q.then(({ data }) => { if (data) setReviews(data); setLoading(false); });
  };
  useEffect(fetchReviews, [filter]);

  const updateReview = async (id: string, is_approved: boolean) => {
    await supabase.from('reviews').update({ is_approved }).eq('id', id);
    toast.success(is_approved ? 'Approved' : 'Rejected');
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    toast.success('Deleted');
    fetchReviews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-heading font-light tracking-wide">Reviews</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-gold-200 px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted" /></div>
      ) : (
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-50">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{r.product?.name}</p>
                <p className="text-xs text-muted">{r.profile?.first_name} {r.profile?.last_name} · {new Date(r.created_at).toLocaleDateString()}</p>
                <StarRating rating={r.rating} size={14} readonly />
                {r.title && <p className="font-medium text-sm mt-2">{r.title}</p>}
                {r.description && <p className="text-sm text-muted mt-1">{r.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Badge color={r.is_approved ? 'green' : 'yellow'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                  {r.verified_purchase && <Badge color="blue">Verified</Badge>}
                </div>
              </div>
              <div className="flex gap-1">
                {!r.is_approved && <button onClick={() => updateReview(r.id, true)} className="p-1.5 rounded hover:bg-green-50 text-green-500"><Check size={16} /></button>}
                {r.is_approved && <button onClick={() => updateReview(r.id, false)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-500"><X size={16} /></button>}
                <button onClick={() => deleteReview(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><X size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
