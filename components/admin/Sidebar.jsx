'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Tag, Zap, Image } from 'lucide-react';

const links = [
  { href: '/admin',              label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/products',     label: 'Products',    icon: Package },
  { href: '/admin/categories',   label: 'Categories',  icon: Tag },
  { href: '/admin/offers',       label: 'Offers',      icon: Zap },
  { href: '/admin/hero-slides',  label: 'Hero Slides', icon: Image },
  { href: '/admin/orders',       label: 'Orders',      icon: ShoppingBag },
  { href: '/admin/customers',    label: 'Customers',   icon: Users },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 h-full flex flex-col overflow-y-auto shrink-0">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2.5">
        <img src="/logo.jpeg" alt="TechStore" className="h-8 w-auto object-contain" />
      </div>

      {user && (
        <div className="px-5 py-4 border-b border-gray-100 bg-red-50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-red-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4">
        {links.map(l => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all border-r-2 ${
                active
                  ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-red-600'
              }`}>
              <Icon size={16} className={active ? 'text-red-600' : 'text-gray-400'} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-gray-100">
        <button onClick={() => { logout(); router.push('/'); onClose?.(); }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors w-full">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
