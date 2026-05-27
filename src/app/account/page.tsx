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
    <div className="min-h-screen max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide font-heading">My Account</h1>
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-1.5"><Shield size={14} /> Admin</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-red-500">
              <LogOut size={14} /> Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="border border-gold-200/40 p-5 hover:shadow-md transition-shadow group">
              <item.icon size={22} className="text-muted mb-2 group-hover:text-foreground transition-colors" />
              <h3 className="font-medium text-sm mb-0.5">{item.label}</h3>
              <p className="text-xs text-muted">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Profile Form */}
        <div className="border border-gold-200/40 p-6">
          <div className="flex items-center gap-2 mb-6">
            <User size={18} className="text-muted" />
            <h2 className="text-lg font-medium">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Input label="Email" value={user.email || ''} disabled className="opacity-60" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="md:col-span-2">
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">City</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border border-gold-200/40 bg-white px-4 py-2.5 text-sm">
                {PAKISTANI_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Postal Code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          </div>
          <div className="mt-6">
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
