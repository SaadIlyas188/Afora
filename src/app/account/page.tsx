'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { User, Package, Heart, Star, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PAKISTANI_CITIES } from '@/lib/utils';

export default function AccountPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', address: '', city: 'Lahore', postal_code: '',
  });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || 'Lahore',
        postal_code: profile.postal_code || '',
      });
    }
  }, [user, loading, profile, router]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update(form).eq('user_id', user!.id);
    if (error) toast.error('Failed to save'); else { toast.success('Profile updated!'); refreshProfile(); }
    setSaving(false);
  };

  if (loading || !user) return null;

  const menuItems = [
    { icon: Package, label: 'My Orders', href: '/account/orders', desc: 'View order history' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist', desc: 'Saved products' },
    { icon: Star, label: 'My Reviews', href: '/account/reviews', desc: 'Your product reviews' },
  ];

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-12 pb-24 md:pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <div>
            <h1 className="text-xl md:text-3xl font-light tracking-wide font-heading">My Account</h1>
            <p className="text-xs text-muted font-body mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-1.5"><Shield size={14} /> Admin</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-red-500">
              <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mb-6 md:mb-10">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="border border-gold-200/40 p-3 md:p-5 hover:shadow-md transition-shadow group text-center md:text-left">
              <item.icon size={18} className="text-muted mb-1.5 group-hover:text-foreground transition-colors mx-auto md:mx-0" />
              <h3 className="font-medium text-xs md:text-sm leading-tight">{item.label}</h3>
              <p className="text-[10px] text-muted hidden md:block mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Profile Form */}
        <div className="border border-gold-200/40 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <User size={16} className="text-muted" />
            <h2 className="text-sm md:text-lg font-medium">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <Input label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <div>
              <label className="block text-[11px] font-body font-medium tracking-[0.1em] uppercase text-muted mb-1.5">Email</label>
              <div className="border border-gold-200/40 bg-cream-50 px-4 py-2.5 text-sm font-body text-foreground/60 truncate">{user.email}</div>
            </div>
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="md:col-span-2">
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-[11px] font-body font-medium tracking-[0.1em] uppercase text-muted mb-1.5">City</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border border-gold-200/40 bg-white px-4 py-2.5 text-sm">
                {PAKISTANI_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Postal Code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          </div>
          <div className="mt-4 md:mt-6">
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
