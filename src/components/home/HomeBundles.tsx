'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HomeBundles() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('bundles')
      .select('*, bundle_products(product_id)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setBundles(data);
        setLoaded(true);
      });
  }, []);

  if (loaded && bundles.length === 0) return null;

  const animDuration = `${Math.max(bundles.length * 6, 18)}s`;

  return (
    <section className="py-10 md:py-16 overflow-hidden" style={{ backgroundColor: '#ede9e0' }}>
      {/* Header */}
      <div className="px-5 md:px-12">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between mb-6 md:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px" style={{ backgroundColor: '#c8a951' }} />
              <span className="text-[10px] font-body tracking-[0.28em] uppercase text-muted">Curated Sets</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-heading font-light text-foreground tracking-wide">Bundle & Save</h2>
          </div>
          <Link
            href="/bundle"
            className="flex items-center gap-1.5 text-[10px] font-body tracking-[0.15em] uppercase hover:opacity-70 transition-opacity mb-1"
            style={{ color: '#c8a951' }}
          >
            View All <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* ── MOBILE: auto-scrolling marquee ── */}
      {!loaded ? (
        <div className="md:hidden flex gap-3 px-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gold-100/60 flex-shrink-0" style={{ width: '60vw', height: 210 }} />
          ))}
        </div>
      ) : (
        <div
          className="md:hidden overflow-hidden select-none"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
        >
          <div
            className="flex gap-3"
            style={{
              animation: `marquee-bundles ${animDuration} linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...bundles, ...bundles].map((bundle, i) => {
              const savings = bundle.compare_at_price ? bundle.compare_at_price - bundle.price : null;
              return (
                <Link
                  key={`${bundle.id}-${i}`}
                  href="/bundle"
                  className="flex-shrink-0 block"
                  style={{ width: '60vw' }}
                  draggable={false}
                >
                  <div className="rounded-xl overflow-hidden bg-white border border-gold-200/40 h-full">
                    {/* Image — natural aspect ratio */}
                    <div className="relative overflow-hidden bg-[#f5ede0]">
                      {bundle.image_url ? (
                        <Image
                          src={getImageUrl(bundle.image_url)}
                          alt={bundle.name}
                          width={0}
                          height={0}
                          sizes="60vw"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                          draggable={false}
                        />
                      ) : (
                        <div className="aspect-[16/9] flex items-center justify-center">
                          <span className="font-heading font-light tracking-[0.3em] text-base" style={{ color: '#c8a951' }}>
                            AFORA
                          </span>
                        </div>
                      )}
                      {savings && savings > 0 && (
                        <span
                          className="absolute top-2 left-2 text-[8px] font-body font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: '#c8a951' }}
                        >
                          Save {formatPrice(savings)}
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="px-3 py-2.5">
                      <h3 className="text-xs font-heading font-light text-foreground tracking-wide leading-snug mb-1 line-clamp-1">
                        {bundle.name}
                      </h3>
                      <p className="text-sm font-heading font-light" style={{ color: '#c8a951' }}>
                        {formatPrice(bundle.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Hold-to-pause hint */}
          <p className="text-center text-[9px] font-body tracking-[0.2em] uppercase text-muted/50 mt-3 px-5">
            Hold to pause
          </p>
        </div>
      )}

      {/* ── DESKTOP: skeleton ── */}
      {!loaded && (
        <div className="hidden md:flex gap-5 overflow-hidden pb-2" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-72 bg-gold-100/60 rounded-2xl flex-shrink-0" style={{ width: '280px' }} />
          ))}
        </div>
      )}

      {/* ── DESKTOP: static grid (1–2 bundles) ── */}
      {loaded && bundles.length <= 2 && (
        <div className="hidden md:block px-5 md:px-12">
          <div className="max-w-[1400px] mx-auto">
            <div className={`grid gap-5 ${bundles.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-2'}`}>
              {bundles.map((bundle, idx) => {
                const savings = bundle.compare_at_price ? bundle.compare_at_price - bundle.price : null;
                const productCount = bundle.bundle_products?.length ?? 0;
                return (
                  <motion.div key={bundle.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: idx * 0.08 }} className="h-full">
                    <Link href="/bundle" className="group block h-full">
                      <div className="relative overflow-hidden rounded-2xl border border-gold-200/50 bg-white hover:border-[#c8a951]/60 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <div className="relative overflow-hidden bg-[#f5ede0] flex-shrink-0">
                          {bundle.image_url ? (
                            <Image src={getImageUrl(bundle.image_url)} alt={bundle.name} width={0} height={0} sizes="50vw" style={{ width: '100%', height: 'auto', display: 'block' }} className="group-hover:scale-[1.03] transition-transform duration-500" />
                          ) : (
                            <div className="aspect-[16/9] flex items-center justify-center">
                              <span className="font-heading font-light tracking-[0.3em] text-2xl" style={{ color: 'rgba(200,169,81,0.4)' }}>AFORA</span>
                            </div>
                          )}
                          {savings && savings > 0 && (
                            <span className="absolute top-3 right-3 text-[9px] font-body font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#c8a951' }}>Save {formatPrice(savings)}</span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          {productCount > 0 && <p className="text-[10px] font-body tracking-[0.12em] uppercase text-muted mb-1.5">{productCount} product{productCount !== 1 ? 's' : ''}</p>}
                          <h3 className="text-base font-heading font-light text-foreground tracking-wide mb-1.5 group-hover:text-[#c8a951] transition-colors leading-snug flex-1">{bundle.name}</h3>
                          {bundle.description && <p className="text-xs font-body text-muted/80 font-light line-clamp-2 mb-3">{bundle.description}</p>}
                          <div className="flex items-center justify-between pt-3 border-t border-gold-100/70 mt-auto">
                            <div>
                              <p className="text-base font-heading font-light text-foreground">{formatPrice(bundle.price)}</p>
                              <p className={`text-[11px] text-muted line-through font-body ${bundle.compare_at_price > 0 ? '' : 'invisible'}`}>
                                {bundle.compare_at_price > 0 ? formatPrice(bundle.compare_at_price) : '\u00a0'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-body font-medium tracking-[0.15em] uppercase group-hover:gap-2 transition-all duration-200" style={{ color: '#c8a951' }}>Shop <ArrowRight size={10} /></div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP: auto-scroll marquee (3+ bundles) ── */}
      {loaded && bundles.length > 2 && (
        <div
          className="hidden md:block overflow-hidden select-none"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
        >
          <div
            className="flex gap-5"
            style={{
              animation: `marquee-bundles ${animDuration} linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
              paddingLeft: '3rem',
              paddingRight: '3rem',
            }}
          >
            {[...bundles, ...bundles].map((bundle, i) => {
              const savings = bundle.compare_at_price ? bundle.compare_at_price - bundle.price : null;
              return (
                <Link key={`d-${bundle.id}-${i}`} href="/bundle" className="flex-shrink-0 group block" style={{ width: '280px' }} draggable={false}>
                  <div className="overflow-hidden rounded-2xl border border-gold-200/50 bg-white hover:border-[#c8a951]/60 hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden bg-[#f5ede0]">
                      {bundle.image_url ? (
                        <Image src={getImageUrl(bundle.image_url)} alt={bundle.name} width={0} height={0} sizes="280px" style={{ width: '100%', height: 'auto', display: 'block' }} className="group-hover:scale-[1.03] transition-transform duration-500" draggable={false} />
                      ) : (
                        <div className="aspect-[16/9] flex items-center justify-center">
                          <span className="font-heading font-light tracking-[0.3em] text-xl" style={{ color: 'rgba(200,169,81,0.4)' }}>AFORA</span>
                        </div>
                      )}
                      {savings && savings > 0 && (
                        <span className="absolute top-2 right-2 text-[9px] font-body font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#c8a951' }}>Save {formatPrice(savings)}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-heading font-light text-foreground tracking-wide mb-2 group-hover:text-[#c8a951] transition-colors leading-snug">{bundle.name}</h3>
                      {bundle.description && <p className="text-[11px] font-body text-muted/80 font-light line-clamp-1 mb-2">{bundle.description}</p>}
                      <div className="flex items-end justify-between pt-2 border-t border-gold-100/70">
                        <div>
                          <p className="text-sm font-heading font-light text-foreground">{formatPrice(bundle.price)}</p>
                          <p className={`text-[11px] text-muted line-through font-body ${bundle.compare_at_price > 0 ? '' : 'invisible'}`}>
                            {bundle.compare_at_price > 0 ? formatPrice(bundle.compare_at_price) : '\u00a0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-center text-[9px] font-body tracking-[0.2em] uppercase text-muted/50 mt-3 px-5">Hold to pause</p>
        </div>
      )}
    </section>
  );
}
