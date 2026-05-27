'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ChevronRight, Minus, Plus } from 'lucide-react';
import type { Product, Review } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import Accordion from '@/components/ui/Accordion';
import ProductCard from '@/components/products/ProductCard';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDesc, setReviewDesc] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*), ingredients:product_ingredients(*)')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setProduct(data);
          // Load reviews
          supabase
            .from('reviews')
            .select('*, profile:profiles(*)')
            .eq('product_id', data.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .then(({ data: reviewData }) => {
              if (reviewData) setReviews(reviewData);
            });
          // Load related
          supabase
            .from('products')
            .select('*, category:categories(*), images:product_images(*)')
            .eq('is_active', true)
            .neq('id', data.id)
            .limit(4)
            .then(({ data: relData }) => {
              if (relData) setRelatedProducts(relData);
            });
        }
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
    addToCart(
      {
        id: product.id,
        type: 'product',
        name: product.name,
        price: product.price,
        image_url: primaryImage?.image_url ?? null,
        slug: product.slug,
      },
      quantity
    );
  };

  const handleSubmitReview = async () => {
    if (!user || !product || reviewRating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    setSubmittingReview(true);
    const supabase = createClient();

    // Check if user has purchased this product
    const { data: orderData } = await supabase
      .from('order_items')
      .select('*, order:orders(*)')
      .eq('product_id', product.id)
      .then(({ data }) => {
        const userOrders = data?.filter((item) => item.order?.user_id === user.id && item.order?.status === 'delivered');
        return { data: userOrders };
      });

    if (!orderData || orderData.length === 0) {
      toast.error('You can only review products you have purchased and received.');
      setSubmittingReview(false);
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: product.id,
      order_id: orderData[0].order.id,
      rating: reviewRating,
      title: reviewTitle || null,
      description: reviewDesc || null,
    });

    if (error) {
      toast.error(error.message.includes('duplicate') ? 'You have already reviewed this product.' : 'Failed to submit review.');
    } else {
      toast.success('Review submitted! It will appear after approval.');
      setReviewRating(0);
      setReviewTitle('');
      setReviewDesc('');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">Product Not Found</h2>
          <Link href="/products" className="text-gold-500 hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const ingredients = product.ingredients?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs md:text-sm text-muted">
          <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-gold-500 transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100 mb-3">
              <Image
                src={getImageUrl(images[selectedImage]?.image_url ?? null)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.step_number && (
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">Step {product.step_number}</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      i === selectedImage ? 'border-gold-300' : 'border-transparent'
                    }`}
                  >
                    <Image src={getImageUrl(img.image_url)} alt="" width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <p className="text-xs md:text-sm text-gold-400 uppercase tracking-[0.2em] mb-2">
              {product.category?.name}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold font-heading mb-3">{product.name}</h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} size={16} />
                <span className="text-sm text-muted">({reviews.length} reviews)</span>
              </div>
            )}

            <p className="text-2xl md:text-3xl font-bold text-gold-500 mb-4">{formatPrice(product.price)}</p>

            <p className="text-sm md:text-base text-muted leading-relaxed mb-6">{product.description}</p>

            {/* How to Use */}
            <div className="bg-gold-50/50 rounded-xl p-4 md:p-5 mb-6">
              <h3 className="text-sm font-semibold mb-2">How to Use</h3>
              <p className="text-sm text-muted">{product.how_to_use}</p>
            </div>

            {product.can_use_individually && (
              <p className="text-xs text-gold-500 mb-6 italic">★ Can be used individually</p>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gold-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gold-50 cursor-pointer">
                  <Minus size={16} />
                </button>
                <span className="px-5 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gold-50 cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <Button onClick={handleAddToCart} size="lg" className="flex-1 gap-2">
                <ShoppingBag size={18} />
                Add to Cart
              </Button>
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  inWishlist ? 'bg-red-50 border-red-200' : 'border-gold-200 hover:bg-gold-50'
                }`}
              >
                <Heart size={20} className={inWishlist ? 'fill-red-400 text-red-400' : 'text-gold-400'} />
              </button>
            </div>

            {/* Ingredients Accordion */}
            {ingredients.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold font-heading mb-3">Ingredients</h3>
                <Accordion
                  allowMultiple
                  items={ingredients.map((ing) => ({
                    title: ing.ingredient_name,
                    content: <p>{ing.ingredient_description}</p>,
                  }))}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <AnimatedSection className="mt-16 md:mt-24">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8">Customer Reviews</h2>

          {reviews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              {reviews.map((review) => (
                <div key={review.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className="text-xs text-muted">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && <h4 className="font-semibold text-sm mb-1">{review.title}</h4>}
                  {review.description && <p className="text-sm text-muted">{review.description}</p>}
                  <p className="text-xs text-gold-400 mt-2">
                    {review.profile?.first_name || 'Customer'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-8">No reviews yet. Be the first to share your experience!</p>
          )}

          {/* Write Review */}
          {user && (
            <div className="glass-card rounded-xl p-6 max-w-lg">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted block mb-1.5">Rating</label>
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={24} />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Review title (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full rounded-lg border border-gold-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-300"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your experience with this product..."
                    value={reviewDesc}
                    onChange={(e) => setReviewDesc(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gold-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-300 resize-none"
                  />
                </div>
                <Button onClick={handleSubmitReview} loading={submittingReview}>
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </AnimatedSection>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <AnimatedSection className="mt-16 md:mt-24">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8">Complete Your Ritual</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
