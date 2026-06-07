'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, mounted } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'admin') router.replace('/');
  }, [mounted, user]);

  // Block back navigation out of admin — replace current entry so back has nowhere to go
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Push a duplicate entry so back button stays within admin
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!mounted || !user || user.role !== 'admin') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-600">
            <Menu size={20} />
          </button>
          <img src="/logo.jpeg" alt="logo" className="h-7 w-auto object-contain" />
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">Admin</span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
