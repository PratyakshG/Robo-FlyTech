'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, mounted } = useAuth();
  const router    = useRouter();

  // Redirect already-logged-in users away from login page
  useEffect(() => {
    if (!mounted) return;
    if (user?.role === 'admin') router.replace('/admin');
    else if (user) router.replace('/');
  }, [mounted, user]);

  if (!mounted || user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      router.replace(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-14">

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Animated red blobs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-[#dc2626] rounded-full blur-[120px]" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] bg-[#dc2626] rounded-full blur-[100px]" />

        {/* Floating tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-white font-black text-sm tracking-widest uppercase">Robo Flytech</span>
        </motion.div>

        {/* Center headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#dc2626] mb-4">[ WELCOME BACK ]</p>
          <h1 className="font-black text-[4.5rem] leading-[0.9] tracking-[-0.04em] text-white mb-6">
            Sign<br />Back<br />In.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Access your orders, wishlist, and saved addresses. Your session is waiting.
          </p>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 flex gap-8">
          {[['10K+', 'Products'], ['50K+', 'Orders'], ['4.9★', 'Rating']].map(([val, label]) => (
            <div key={label}>
              <p className="text-white font-black text-xl">{val}</p>
              <p className="text-gray-500 text-[11px] uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md">

          {/* Mobile logo + back */}
          <div className="flex items-center justify-between mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 object-contain" />
              <span className="font-black text-sm tracking-widest uppercase text-[#0a0a0a]">Robo Flytech</span>
            </div>
            <Link href="/" className="text-xs font-bold text-gray-400 hover:text-[#0a0a0a] transition-colors">
              ← Back
            </Link>
          </div>

          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#dc2626] mb-2">[ ACCOUNT / LOGIN ]</p>
          <h2 className="font-black text-[2.8rem] tracking-[-0.04em] leading-none text-[#0a0a0a] mb-2">Sign In</h2>
          <p className="text-sm text-gray-400 mb-10">Enter your credentials to continue.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 border border-[#dc2626] bg-red-50 text-[#dc2626] text-xs font-semibold px-4 py-3 mb-6">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" placeholder="you@example.com" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 pl-10 pr-4 py-3.5 text-sm text-[#0a0a0a] placeholder:text-gray-300 outline-none focus:border-[#0a0a0a] transition-colors" />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" placeholder="••••••••" required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 pl-10 pr-4 py-3.5 text-sm text-[#0a0a0a] placeholder:text-gray-300 outline-none focus:border-[#0a0a0a] transition-colors" />
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <button type="submit" disabled={loading}
                className="group w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 mt-2 flex items-center justify-center gap-2 hover:bg-[#dc2626] transition-colors disabled:opacity-50">
                {loading ? 'Signing in...' : (
                  <>Sign In <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </motion.div>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-400">
            No account?{' '}
            <Link href="/register" className="text-[#0a0a0a] font-bold hover:text-[#dc2626] transition-colors">
              Create one →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
