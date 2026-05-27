'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Password reset link sent!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading gold-gradient-text mb-2">Reset Password</h1>
          <p className="text-sm text-muted">We&apos;ll send you a reset link</p>
        </div>
        <div className="glass-card rounded-2xl p-6 md:p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-600 mb-4">Check your email for the reset link!</p>
              <Link href="/auth/login" className="text-gold-500 hover:underline text-sm">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Link</Button>
            </form>
          )}
          <p className="text-sm text-muted text-center mt-6">
            <Link href="/auth/login" className="text-gold-500 hover:underline">← Back to Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
