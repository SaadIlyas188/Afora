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
import { ShoppingBag, Check, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-cream-100 via-cream-50 to-gold-50 py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 md:w-96 md:h-96 rounded-full bg-gold-100/30 blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} />
              Save {formatPrice(savings)}
            </div>
            <h1 className="text-3xl md:text-6xl font-bold font-heading gold-gradient-text mb-4">
              {bundle.name}
            </h1>
            <p className="text-sm md:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              {bundle.description}
            </p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Bundle Price</p>
                <p className="text-3xl md:text-4xl font-bold gold-gradient-text">{formatPrice(bundle.price)}</p>
              </div>
              {bundle.compare_at_price && (
                <div className="text-center">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Individual Total</p>
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
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-heading mb-3">Your 6-Step Ritual</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
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
                  <div className="absolute -top-3 -left-3 z-10 w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">Step {product.step_number}</span>
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-100 border border-gold-100/50">
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
                  <p className="text-xs text-gold-400 uppercase tracking-wider mb-1">{product.category?.name}</p>
                  <h3 className="text-xl md:text-2xl font-bold font-heading mb-2">{product.name}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">{product.description}</p>

                  <div className="bg-gold-50/50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium mb-1">How to Use:</p>
                    <p className="text-xs text-muted">{product.how_to_use}</p>
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
                                  <Check size={14} className="text-gold-400 flex-shrink-0 mt-0.5" />
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
                    <span className="text-lg font-semibold text-gold-500">{formatPrice(product.price)}</span>
                    <Link href={`/products/${product.slug}`} className="text-xs text-gold-500 hover:underline">
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
      <section className="bg-gradient-to-r from-cream-200 via-cream-100 to-gold-50 py-12 md:py-16 px-4 text-center">
        <AnimatedSection>
          <h2 className="text-2xl md:text-4xl font-bold font-heading gold-gradient-text mb-4">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-sm text-muted mb-8 max-w-md mx-auto">
            Get the complete 6-step system and save {formatPrice(savings)} today.
          </p>
          <Button onClick={handleAddBundle} size="lg" className="gap-2 text-base px-12">
            <ShoppingBag size={18} />
            Add Bundle to Cart — {formatPrice(bundle.price)}
          </Button>
        </AnimatedSection>
      </section>
    </div>
  );
}
