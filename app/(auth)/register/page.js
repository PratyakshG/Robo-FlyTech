'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full Name', type: 'text',     ph: 'John Doe',         Icon: User },
    { key: 'email',    label: 'Email',     type: 'email',    ph: 'you@example.com',  Icon: Mail },
    { key: 'password', label: 'Password',  type: 'password', ph: '••••••••',         Icon: Lock },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── RIGHT FORM PANEL (comes first in DOM for mobile, shown left on lg) ── */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-12 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 object-contain" />
            <span className="font-black text-sm tracking-widest uppercase text-[#0a0a0a]">RoboStore</span>
          </div>

          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#dc2626] mb-2">[ ACCOUNT / NEW ]</p>
          <h2 className="font-black text-[2.8rem] tracking-[-0.04em] leading-none text-[#0a0a0a] mb-2">Create<br />Account</h2>
          <p className="text-sm text-gray-400 mb-10">Join thousands of shoppers today.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 border border-[#dc2626] bg-red-50 text-[#dc2626] text-xs font-semibold px-4 py-3 mb-6">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ key, label, type, ph, Icon }, i) => (
              <motion.div key={key}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.08 }}>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={type} placeholder={ph} required
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 pl-10 pr-4 py-3.5 text-sm text-[#0a0a0a] placeholder:text-gray-300 outline-none focus:border-[#0a0a0a] transition-colors" />
                </div>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}>
              <button type="submit" disabled={loading}
                className="group w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 mt-2 flex items-center justify-center gap-2 hover:bg-[#dc2626] transition-colors disabled:opacity-50">
                {loading ? 'Creating Account...' : (
                  <>Create Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
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
            Already have an account?{' '}
            <Link href="/login" className="text-[#0a0a0a] font-bold hover:text-[#dc2626] transition-colors">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ── LEFT DARK PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-14 order-1 lg:order-2">

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Diagonal scan line animation */}
        <motion.div
          animate={{ x: ['−100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-transparent via-[#dc2626]/30 to-transparent" />

        {/* Animated red blobs */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-[-100px] w-[380px] h-[380px] bg-[#dc2626] rounded-full blur-[120px]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[-80px] left-[-60px] w-[300px] h-[300px] bg-[#dc2626] rounded-full blur-[100px]" />

        {/* Floating dots */}
        {[
          { top: '20%', left: '15%', delay: 0 },
          { top: '55%', left: '70%', delay: 1 },
          { top: '75%', left: '25%', delay: 2 },
          { top: '35%', left: '80%', delay: 0.5 },
        ].map((pos, i) => (
          <motion.div key={i}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: pos.delay }}
            className="absolute w-1.5 h-1.5 bg-[#dc2626] rounded-full"
            style={{ top: pos.top, left: pos.left }} />
        ))}

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-white font-black text-sm tracking-widest uppercase">RoboStore</span>
        </motion.div>

        {/* Center headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#dc2626] mb-4">[ JOIN US TODAY ]</p>
          <h1 className="font-black text-[4.5rem] leading-[0.9] tracking-[-0.04em] text-white mb-6">
            Start<br />Your<br />Journey.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Create your account and unlock exclusive deals, fast checkout, and order tracking — all in one place.
          </p>
        </motion.div>

        {/* Bottom perks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 space-y-3">
          {[
            ['✦', 'Fast shipping on all orders'],
            ['✦', 'Exclusive member-only offers'],
            ['✦', 'Track orders in real time'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-[#dc2626] text-xs">{icon}</span>
              <span className="text-gray-400 text-xs">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
