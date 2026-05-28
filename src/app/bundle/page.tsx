'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Bundle, Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Accordion from '@/components/ui/Accordion';
import { ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BundlePage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bundleProducts, setBundleProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('bundles')
      .select('*')
      .eq('is_active', true)
      .order('created_at')
      .then(async ({ data: bundlesData }) => {
        if (bundlesData && bundlesData.length > 0) {
          setBundles(bundlesData);
          const productsMap: Record<string, Product[]> = {};
          await Promise.all(
            bundlesData.map(async (b) => {
              const { data: bpData } = await supabase
                .from('bundle_products')
                .select('*, product:products(*, category:categories(*), images:product_images(*), ingredients:product_ingredients(*))')
                .eq('bundle_id', b.id)
                .order('sort_order');
              if (bpData) {
                productsMap[b.id] = bpData.map((bp: { product: Product }) => bp.product).filter(Boolean);
              }
            })
          );
          setBundleProducts(productsMap);
        }
        setLoading(false);
      });
  }, []);

  const bundle = bundles[activeIndex] ?? null;
  const products = bundle ? (bundleProducts[bundle.id] ?? []) : [];
  const savings = bundle ? ((bundle.compare_at_price || 0) - bundle.price) : 0;
  const isMulti = bundles.length > 1;

  const goNext = () => { if (activeIndex < bundles.length - 1) setActiveIndex((i) => i + 1); };
  const goPrev = () => { if (activeIndex > 0) setActiveIndex((i) => i - 1); };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  const handleAddBundle = () => {
    if (!bundle) return;
    addToCart({
      id: bundle.id,
      type: 'bundle',
      name: bundle.name,
      price: bundle.price,
      image_url: bundle.image_url,
      slug: bundle.slug,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bundle) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="bg-[#0f0f0f] py-8 md:py-24 px-6 md:px-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            drag={isMulti ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={handleDragEnd}
            className="max-w-[1400px] mx-auto text-center select-none cursor-default"
          >
            <div className="flex flex-col items-center gap-2 mb-4 md:mb-8">
              <div className="w-8 h-px bg-[#c8a951]" />
              {savings > 0 && (
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c8a951]/80 font-body">Save {formatPrice(savings)}</p>
              )}
            </div>
            <h1 className="text-2xl md:text-6xl font-light tracking-wide font-heading text-gold-50 mb-2 md:mb-4">
              {bundle.name}
            </h1>
            <p className="text-xs md:text-lg font-body text-gold-400 font-light max-w-2xl mx-auto mb-4 md:mb-8 leading-relaxed">
              {bundle.description}
            </p>
            <div className="flex items-center justify-center gap-6 mb-4 md:mb-8">
              <div className="text-center">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c8a951]/70 mb-1 font-body">Bundle Price</p>
                <p className="text-2xl md:text-4xl font-light tracking-wide text-gold-50">{formatPrice(bundle.price)}</p>
              </div>
              {bundle.compare_at_price && (
                <div className="text-center">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#c8a951]/70 mb-1 font-body">You Save</p>
                  <p className="text-lg md:text-xl text-[#c8a951] font-light">{formatPrice(savings)}</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleAddBundle}
              size="lg"
              variant="outline"
              className="gap-2 px-8 md:px-12"
              style={{ borderColor: '#c8a951', color: '#c8a951' }}
            >
              <ShoppingBag size={16} />
              Add Bundle to Cart
            </Button>
          </motion.div>
        </AnimatePresence>

        {/* Bundle navigator — only when multiple bundles */}
        {isMulti && (
          <div className="flex items-center justify-center gap-3 mt-5 md:mt-8">
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="w-7 h-7 flex items-center justify-center border border-[#c8a951]/30 text-[#c8a951]/50 hover:border-[#c8a951] hover:text-[#c8a951] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Previous bundle"
            >
              <ChevronLeft size={13} />
            </button>
            <div className="flex items-center gap-2">
              {bundles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Select bundle ${i + 1}`}
                  className="transition-all duration-300"
                  style={{
                    width: i === activeIndex ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: i === activeIndex ? '#c8a951' : 'rgba(200,169,81,0.28)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              disabled={activeIndex === bundles.length - 1}
              className="w-7 h-7 flex items-center justify-center border border-[#c8a951]/30 text-[#c8a951]/50 hover:border-[#c8a951] hover:text-[#c8a951] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Next bundle"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {isMulti && (
          <p className="md:hidden text-center text-[9px] tracking-[0.2em] uppercase text-[#c8a951]/35 mt-2 font-body">
            Swipe to browse
          </p>
        )}
      </section>

      {/* Bundle Image Gallery — shown when bundle has an image, between hero and steps */}
      <AnimatePresence mode="wait">
        {bundle.image_url && (
          <motion.div
            key={`gallery-${bundle.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#f5ede0]"
          >
            <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-6 md:py-10">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl" style={{ aspectRatio: '16 / 7' }}>
                <Image
                  src={getImageUrl(bundle.image_url)}
                  alt={bundle.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Subtle luxury overlay — stronger gradient to protect caption readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-5">
                  <p className="inline-block text-[7px] font-body tracking-[0.18em] uppercase text-white/75 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                    {bundle.name}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps Breakdown */}
      <AnimatePresence mode="wait">
        <motion.section
          key={`steps-${bundle.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24"
        >
          <AnimatedSection className="text-center mb-12">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gold-300" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted">The Ritual</p>
            </div>
            <h2 className="text-2xl md:text-4xl font-light tracking-wide font-heading mb-3">
              {products.length > 0 ? `Your ${products.length}-Step Ritual` : 'Your Ritual'}
            </h2>
            <p className="text-sm font-body text-muted font-light max-w-lg mx-auto">
              Each step is designed to build upon the last, creating a complete facial experience.
            </p>
          </AnimatedSection>

          <div className="space-y-8 md:space-y-12">
            {products.map((product, index) => {
              const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* ── Mobile: compact timeline strip ── */}
                  <div className="md:hidden flex gap-4 items-start">
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-body font-semibold text-white flex-shrink-0"
                        style={{ backgroundColor: '#c8a951' }}
                      >
                        {String(product.step_number ?? index + 1).padStart(2, '0')}
                      </div>
                      {index < products.length - 1 && (
                        <div className="w-px flex-1 mt-2 min-h-[2rem]" style={{ backgroundColor: 'rgba(200,169,81,0.25)' }} />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 rounded-2xl p-3 ${index % 3 === 0 ? 'bg-[#f5f0e8]' : index % 3 === 1 ? 'bg-white border border-gold-100' : 'bg-[#faf8f4]'}`}>
                      <div className="flex gap-3 items-start mb-3">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-cream-200 rounded-xl">
                          <Image
                            src={getImageUrl(primaryImage?.image_url ?? null)}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-body tracking-[0.15em] uppercase text-muted mb-0.5">{product.category?.name}</p>
                          <h3 className="text-sm font-heading font-light tracking-wide text-foreground leading-snug mb-1">{product.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-body font-medium text-foreground">{formatPrice(product.price)}</span>
                            <Link href={`/products/${product.slug}`} className="text-[10px] font-body tracking-[0.1em] uppercase hover:opacity-70 transition-opacity" style={{ color: '#c8a951' }}>
                              View →
                            </Link>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-body text-muted font-light leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                      {product.how_to_use && (
                        <div className="rounded-lg px-3 py-2 mb-2 bg-white border-l-2" style={{ borderColor: '#c8a951' }}>
                          <p className="text-[10px] font-body font-medium tracking-[0.1em] uppercase mb-0.5" style={{ color: '#c8a951' }}>How to Use</p>
                          <p className="text-[11px] font-body text-muted font-light leading-relaxed">{product.how_to_use}</p>
                        </div>
                      )}
                      {product.ingredients && product.ingredients.length > 0 && (
                        <Accordion
                          items={[{
                            title: `Ingredients (${product.ingredients.length})`,
                            content: (
                              <div className="space-y-1.5">
                                {product.ingredients.sort((a, b) => a.sort_order - b.sort_order).map((ing) => (
                                  <div key={ing.id} className="flex gap-2">
                                    <Check size={12} className="text-muted flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-xs font-medium">{ing.ingredient_name}</span>
                                      <span className="text-xs text-muted"> — {ing.ingredient_description}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ),
                          }]}
                        />
                      )}
                    </div>
                  </div>

                  {/* ── Desktop: alternating layout ── */}
                  <div className={`hidden md:flex ${isEven ? 'flex-row' : 'flex-row-reverse'} gap-12 items-center rounded-2xl p-8 ${isEven ? 'bg-white' : 'bg-[#faf8f4]'}`}>
                    <div className="w-2/5 relative">
                      <div className="absolute -top-3 -left-3 z-10">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full font-body font-semibold text-sm text-white" style={{ backgroundColor: '#c8a951' }}>0{product.step_number}</span>
                      </div>
                      <div className="aspect-square overflow-hidden bg-cream-100">
                        <Image
                          src={getImageUrl(primaryImage?.image_url ?? null)}
                          alt={product.name}
                          width={500}
                          height={500}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="w-3/5">
                      <p className="text-xs text-[#c8a951] uppercase tracking-wider mb-1 font-body font-medium">{product.category?.name}</p>
                      <h3 className="text-xl md:text-2xl font-light tracking-wide font-heading mb-2">{product.name}</h3>
                      <p className="text-sm font-body text-muted font-light leading-relaxed mb-4">{product.description}</p>
                      <div className="bg-[#f5f0e8] border-l-2 border-[#c8a951] px-4 py-3 mb-4">
                        <p className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-[#c8a951] mb-1">How to Use</p>
                        <p className="text-xs font-body text-muted font-light">{product.how_to_use}</p>
                      </div>
                      {product.ingredients && product.ingredients.length > 0 && (
                        <Accordion
                          items={[{
                            title: `View Ingredients (${product.ingredients.length})`,
                            content: (
                              <div className="space-y-2">
                                {product.ingredients.sort((a, b) => a.sort_order - b.sort_order).map((ing) => (
                                  <div key={ing.id} className="flex gap-2">
                                    <Check size={14} className="text-muted flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-xs font-medium">{ing.ingredient_name}</span>
                                      <span className="text-xs text-muted"> — {ing.ingredient_description}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ),
                          }]}
                        />
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</span>
                        <Link href={`/products/${product.slug}`} className="text-xs text-foreground hover:underline">View Details →</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Bottom CTA */}
      <AnimatePresence mode="wait">
        <motion.section
          key={`cta-${bundle.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gold-50 py-12 md:py-16 px-6 md:px-12 text-center"
        >
          <AnimatedSection>
            <div className="max-w-[1400px] mx-auto">
              <h2 className="text-2xl md:text-4xl font-light tracking-wide font-heading text-foreground mb-4">
                Ready to Transform Your Skin?
              </h2>
              <p className="text-sm font-body text-muted font-light mb-8 max-w-md mx-auto">
                {savings > 0
                  ? `Get ${bundle.name} and save ${formatPrice(savings)} today.`
                  : `Get ${bundle.name} today.`}
              </p>
              <Button onClick={handleAddBundle} size="lg" className="gap-2 text-base px-12">
                <ShoppingBag size={18} />
                Add Bundle to Cart — {formatPrice(bundle.price)}
              </Button>
            </div>
          </AnimatedSection>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

