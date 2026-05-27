'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import type { WishlistItem } from '@/types';
import { toast } from 'sonner';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [localWishlist, setLocalWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load wishlist
  useEffect(() => {
    if (user) {
      loadWishlistFromDB();
    } else {
      const saved = localStorage.getItem('afora-wishlist');
      if (saved) setLocalWishlist(JSON.parse(saved));
    }
  }, [user]);

  // Sync local wishlist to DB on login
  useEffect(() => {
    if (user && localWishlist.length > 0) {
      syncLocalToDB();
    }
  }, [user]);

  // Save local wishlist
  useEffect(() => {
    if (!user) {
      localStorage.setItem('afora-wishlist', JSON.stringify(localWishlist));
    }
  }, [localWishlist, user]);

  const loadWishlistFromDB = async () => {
    const supabase = createClient();
    setLoading(true);
    const { data } = await supabase
      .from('wishlists')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const syncLocalToDB = async () => {
    const supabase = createClient();
    for (const productId of localWishlist) {
      await supabase.from('wishlists').upsert(
        { user_id: user!.id, product_id: productId },
        { onConflict: 'user_id,product_id' }
      );
    }
    setLocalWishlist([]);
    localStorage.removeItem('afora-wishlist');
    loadWishlistFromDB();
  };

  const isInWishlist = useCallback(
    (productId: string) => {
      if (user) {
        return items.some((i) => i.product_id === productId);
      }
      return localWishlist.includes(productId);
    },
    [items, localWishlist, user]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productName = 'Product') => {
      if (user) {
        const supabase = createClient();
        const existing = items.find((i) => i.product_id === productId);
        if (existing) {
          await supabase.from('wishlists').delete().eq('id', existing.id);
          setItems((prev) => prev.filter((i) => i.id !== existing.id));
          toast.success(`${productName} removed from wishlist`);
        } else {
          const { data } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productId })
            .select('*, product:products(*)')
            .single();
          if (data) {
            setItems((prev) => [data, ...prev]);
            toast.success(`${productName} added to wishlist`);
          }
        }
      } else {
        setLocalWishlist((prev) => {
          if (prev.includes(productId)) {
            toast.success(`${productName} removed from wishlist`);
            return prev.filter((id) => id !== productId);
          }
          toast.success(`${productName} added to wishlist`);
          return [...prev, productId];
        });
      }
    },
    [user, items]
  );

  return (
    <WishlistContext.Provider value={{ items, loading, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
