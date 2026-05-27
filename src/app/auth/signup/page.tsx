'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, firstName, lastName);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! Please check your email to verify.');
      router.push('/account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading gold-gradient-text mb-2">Create Account</h1>
          <p className="text-sm text-muted">Join the AFORA family</p>
        </div>
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Sidra" required />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Shahzad" required />
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
            <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
          </form>
          <p className="text-sm text-muted text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold-500 hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
