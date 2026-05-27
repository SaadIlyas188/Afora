'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Bundle, Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/ui/Button';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Accordion from '@/components/ui/Accordion';
import { ShoppingBag, Check } from 'lucide-react';

export default function BundlePage() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('bundles')
      .select('*')
      .eq('slug', 'afora-complete-facial-system')
      .single()
      .then(async ({ data: bundleData }) => {
        if (bundleData) {
          setBundle(bundleData);
          const { data: bpData } = await supabase
            .from('bundle_products')
            .select('*, product:products(*, category:categories(*), images:product_images(*), ingredients:product_ingredients(*))')
            .eq('bundle_id', bundleData.id)
            .order('sort_order');
          if (bpData) {
            setProducts(bpData.map((bp) => bp.product).filter(Boolean));
          }
        }
        setLoading(false);
      });
  }, []);

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

  const savings = (bundle.compare_at_price || 0) - bundle.price;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero */}
      <section className="bg-gold-50 py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-8 h-px bg-gold-300" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted">Save {formatPrice(savings)}</p>
            </div>
            <h1 className="text-3xl md:text-6xl font-light tracking-wide font-heading text-foreground mb-4">
              {bundle.name}
            </h1>
            <p className="text-sm md:text-lg font-body text-muted font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              {bundle.description}
            </p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">Bundle Price</p>
                <p className="text-3xl md:text-4xl font-light tracking-wide text-foreground">{formatPrice(bundle.price)}</p>
              </div>
              {bundle.compare_at_price && (
                <div className="text-center">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">Individual Total</p>
                  <p className="text-xl text-muted line-through">{formatPrice(bundle.compare_at_price)}</p>
                </div>
              )}
            </div>
            <Button onClick={handleAddBundle} size="lg" className="gap-2 text-base px-12">
              <ShoppingBag size={18} />
              Add Bundle to Cart
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps Breakdown */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <AnimatedSection className="text-center mb-12">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-8 h-px bg-gold-300" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted">The Ritual</p>
          </div>
          <h2 className="text-2xl md:text-4xl font-light tracking-wide font-heading mb-3">Your 6-Step Ritual</h2>
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
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-12 items-center`}
              >
                {/* Image */}
                <div className="w-full md:w-2/5 relative">
                  <div className="absolute -top-3 -left-3 z-10">
                    <span className="text-[10px] font-body tracking-[0.15em] text-muted">Step {product.step_number}</span>
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

                {/* Info */}
                <div className="w-full md:w-3/5">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">{product.category?.name}</p>
                  <h3 className="text-xl md:text-2xl font-light tracking-wide font-heading mb-2">{product.name}</h3>
                  <p className="text-sm font-body text-muted font-light leading-relaxed mb-4">{product.description}</p>

                  <div className="bg-gold-50 p-3 mb-4">
                    <p className="text-xs font-medium mb-1">How to Use:</p>
                    <p className="text-xs font-body text-muted font-light">{product.how_to_use}</p>
                  </div>

                  {product.ingredients && product.ingredients.length > 0 && (
                    <Accordion
                      items={[
                        {
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
                        },
                      ]}
                    />
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</span>
                    <Link href={`/products/${product.slug}`} className="text-xs text-foreground hover:underline">
                      View Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gold-50 py-12 md:py-16 px-6 md:px-12 text-center">
        <AnimatedSection>
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-2xl md:text-4xl font-light tracking-wide font-heading text-foreground mb-4">
              Ready to Transform Your Skin?
            </h2>
            <p className="text-sm font-body text-muted font-light mb-8 max-w-md mx-auto">
              Get the complete 6-step system and save {formatPrice(savings)} today.
            </p>
            <Button onClick={handleAddBundle} size="lg" className="gap-2 text-base px-12">
              <ShoppingBag size={18} />
              Add Bundle to Cart — {formatPrice(bundle.price)}
            </Button>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
