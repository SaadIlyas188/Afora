'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Review } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';

export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return; }
    if (user) {
      const supabase = createClient();
      supabase
        .from('reviews')
        .select('*, product:products(name, slug)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setReviews(data as any);
          setLoading(false);
        });
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide font-heading">My Reviews</h1>
        <Link href="/account"><Button variant="ghost" size="sm">← Back</Button></Link>
      </div>

      {reviews.length === 0 ? (
        <EmptyState type="reviews" />
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-gold-200/40 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link href={`/products/${(review as any).product?.slug}`} className="font-medium hover:text-foreground">
                    {(review as any).product?.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size={14} readonly />
                    <Badge color={review.is_approved ? 'green' : 'yellow'}>{review.is_approved ? 'Approved' : 'Pending'}</Badge>
                  </div>
                </div>
                <span className="text-xs text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              {review.title && <p className="font-medium text-sm mt-2">{review.title}</p>}
              {review.description && <p className="text-sm text-muted mt-1">{review.description}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
