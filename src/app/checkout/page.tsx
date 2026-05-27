'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, generateOrderNumber, PAKISTANI_CITIES } from '@/lib/utils';
import { sendOrderConfirmation, buildOrderItemsHtml } from '@/lib/email';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { MapPin, Package, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, subtotal, deliveryCharges, discount, total, promoCode, clearCart } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore',
    postal_code: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved info
  useEffect(() => {
    const saved = localStorage.getItem('afora-checkout-info');
    if (saved) {
      const parsed = JSON.parse(saved);
      setForm((prev) => ({ ...prev, ...parsed }));
    }
    if (profile) {
      setForm((prev) => ({
        ...prev,
        first_name: prev.first_name || profile.first_name || '',
        last_name: prev.last_name || profile.last_name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || profile.phone || '',
        address: prev.address || profile.address || '',
        city: prev.city || profile.city || 'Lahore',
        postal_code: prev.postal_code || profile.postal_code || '',
      }));
    }
  }, [profile, user]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim()) errs.last_name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.trim().length < 10) errs.phone = 'Valid phone required';
    if (!form.address.trim()) errs.address = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.postal_code.trim()) errs.postal_code = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    const supabase = createClient();
    const orderNumber = generateOrderNumber();

    // Save checkout info to localStorage
    localStorage.setItem(
      'afora-checkout-info',
      JSON.stringify({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
      })
    );

    // Also update profile if logged in
    if (user) {
      await supabase.from('profiles').update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
      }).eq('user_id', user.id);
    }

    // Get promo code ID if applied
    let promoCodeId = null;
    if (promoCode) {
      const { data: promoData } = await supabase
        .from('promo_codes')
        .select('id')
        .eq('code', promoCode.code)
        .single();
      if (promoData) {
        promoCodeId = promoData.id;
        // Increment usage
        try {
          await supabase.rpc('increment_promo_usage', { promo_id: promoData.id });
        } catch {
          // If RPC doesn't exist, try direct update
          await supabase.from('promo_codes').update({ times_used: (promoData as any).times_used + 1 }).eq('id', promoData.id);
        }
      }
    }

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        subtotal,
        delivery_charges: deliveryCharges,
        discount_amount: discount,
        promo_code_id: promoCodeId,
        total,
        status: 'pending',
        notes: form.notes || null,
      })
      .select()
      .single();

    if (error || !order) {
      toast.error('Failed to place order. Please try again.');
      setPlacing(false);
      return;
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.type === 'product' ? item.id : null,
      bundle_id: item.type === 'bundle' ? item.id : null,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    await supabase.from('order_items').insert(orderItems);

    // Send confirmation email
    const itemsHtml = buildOrderItemsHtml(
      items.map((i) => ({
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        total_price: i.price * i.quantity,
      }))
    );

    sendOrderConfirmation({
      to_email: form.email,
      to_name: `${form.first_name} ${form.last_name}`,
      order_number: orderNumber,
      order_date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }),
      items_html: itemsHtml,
      subtotal: formatPrice(subtotal),
      delivery: deliveryCharges === 0 ? 'Free' : formatPrice(deliveryCharges),
      discount: discount > 0 ? `-${formatPrice(discount)}` : 'Rs. 0',
      total: formatPrice(total),
      address: form.address,
      city: form.city,
      phone: form.phone,
    }).catch(() => {});

    clearCart();
    router.push(`/order-confirmation/${order.id}`);
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-2xl md:text-4xl font-bold font-heading mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatedSection>
            {/* Contact Information */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-gold-400" />
                <h2 className="text-lg font-semibold">Contact & Shipping</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name *" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} error={errors.first_name} placeholder="Sidra" />
                <Input label="Last Name *" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} error={errors.last_name} placeholder="Shahzad" />
                <Input label="Email *" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} placeholder="you@example.com" />
                <Input label="Phone *" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} placeholder="0300 1234567" />
                <div className="md:col-span-2">
                  <Input label="Address *" value={form.address} onChange={(e) => handleChange('address', e.target.value)} error={errors.address} placeholder="House/Street/Area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">City *</label>
                  <select
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full rounded-lg border border-gold-200 bg-white px-4 py-2.5 text-sm focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200/50"
                  >
                    {PAKISTANI_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <Input label="Postal Code *" value={form.postal_code} onChange={(e) => handleChange('postal_code', e.target.value)} error={errors.postal_code} placeholder="54000" />
                <div className="md:col-span-2">
                  <Input label="Order Notes (optional)" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any special instructions..." />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Payment Method */}
          <AnimatedSection delay={0.1}>
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-gold-400" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              <div className="bg-gold-50/50 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted">Pay when your order arrives at your doorstep</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass-card rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold font-heading mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium ml-4">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-gold-100 pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>{deliveryCharges === 0 ? 'Free' : formatPrice(deliveryCharges)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gold-100 pt-3">
                <span>Total</span>
                <span className="text-gold-600">{formatPrice(total)}</span>
              </div>
            </div>

            <Button onClick={handlePlaceOrder} loading={placing} className="w-full mt-6 gap-2" size="lg">
              Place Order
              <ChevronRight size={16} />
            </Button>

            {!user && (
              <p className="text-xs text-muted text-center mt-3">
                <a href="/auth/login" className="text-gold-500 hover:underline">Sign in</a> to track your orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
