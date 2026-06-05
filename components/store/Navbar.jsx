'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, User, ShoppingBag, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { getCategories, getActiveOffers } from '@/lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tickerItems, setTickerItems] = useState(['🚚 FREE EXPRESS SHIPPING OVER ₹999']);
  const catCloseTimer = useRef(null);

  const openCat  = () => { clearTimeout(catCloseTimer.current); setCatOpen(true); };
  const closeCat = () => { catCloseTimer.current = setTimeout(() => setCatOpen(false), 120); };

  useEffect(() => {
    getCategories().then(r => setCategories(r.data || [])).catch(() => {});
    getActiveOffers().then(r => {
      const offers = r.data || [];
      const items = ['🚚 FREE EXPRESS SHIPPING OVER ₹999'];
      offers.forEach(o => {
        const val = o.type === 'percentage' ? `${o.value}% OFF` : `₹${o.value} OFF`;
        items.unshift(`⚡ ${o.name?.toUpperCase() || 'FLASH SALE'} — UP TO ${val}`);
      });
      setTickerItems(items);
    }).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Ticker bar */}
      <div className="bg-[#dc2626] text-white overflow-hidden h-8 flex items-center">
        <div className="ticker-wrap w-full">
          <div className="ticker-track">
            {[0, 1].map(set => (
              <span key={set} className="ticker-set">
                {Array(Math.ceil(10 / Math.max(tickerItems.length, 1))).fill(tickerItems).flat().map((item, i) => (
                  <span key={i} className="inline-block text-[11px] font-semibold tracking-widest uppercase mx-10 shrink-0">
                    {item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <img src="/logo.jpeg" alt="Robo Flytech" className="h-10 w-auto object-contain" />
            <span className="hidden sm:inline-block text-sm font-bold uppercase tracking-[0.2em] text-[#0a0a0a]">Robo Flytech</span>
          </Link>

          {/* Nav links — centered */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link href="/"
              className={`px-3 py-1.5 text-sm font-medium transition-colors relative pb-1 group ${
                pathname === '/' ? 'text-[#dc2626]' : 'text-gray-600 hover:text-[#0a0a0a]'
              }`}>
              Home
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] origin-left transition-transform duration-300 ${
                pathname === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
            <Link href="/products"
              className={`px-3 py-1.5 text-sm font-medium transition-colors relative pb-1 group ${
                pathname.startsWith('/products') ? 'text-[#dc2626]' : 'text-gray-600 hover:text-[#0a0a0a]'
              }`}>
              Products
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] origin-left transition-transform duration-300 ${
                pathname.startsWith('/products') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
            <Link href="/about"
              className={`px-3 py-1.5 text-sm font-medium transition-colors relative pb-1 group ${
                pathname === '/about' ? 'text-[#dc2626]' : 'text-gray-600 hover:text-[#0a0a0a]'
              }`}>
              About Us
              <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] origin-left transition-transform duration-300 ${
                pathname === '/about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>

            {/* Categories dropdown */}
            <div className="relative" onMouseEnter={openCat} onMouseLeave={closeCat}>
              <button className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 pb-1 relative group ${
                catOpen ? 'text-[#dc2626]' : 'text-gray-600 hover:text-[#0a0a0a]'
              }`}>
                Categories
                <ChevronDown size={13} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] origin-left transition-transform duration-300 ${
                  catOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    onMouseEnter={openCat}
                    onMouseLeave={closeCat}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 shadow-lg min-w-[180px] z-50">
                    {categories.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-gray-400">No categories</p>
                    ) : (
                      categories.map(cat => (
                        <Link key={cat._id} href={`/products?category=${cat.name}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#dc2626] transition-colors border-b border-gray-100 last:border-0">
                          <span>{cat.name}</span>
                        </Link>
                      ))
                    )}
                    <Link href="/products" onClick={() => setCatOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-bold tracking-widest uppercase text-[#dc2626] hover:bg-red-50 transition-colors border-t border-gray-200">
                      View All →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user?.role === 'admin' && (
              <Link href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-[#dc2626] flex items-center gap-1">
                <LayoutDashboard size={13} /> Admin
              </Link>
            )}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-600 hover:text-[#0a0a0a] transition-colors">
              <Search size={18} strokeWidth={1.8} />
            </button>

            {/* User */}
            {user ? (
              <div className="hidden lg:flex items-center gap-1">
                <Link href="/profile" className="p-2 text-gray-600 hover:text-[#0a0a0a] transition-colors">
                  <User size={18} strokeWidth={1.8} />
                </Link>
                <button onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-[#dc2626] transition-colors">
                  <LogOut size={16} strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:block p-2 text-gray-600 hover:text-[#0a0a0a] transition-colors">
                <User size={18} strokeWidth={1.8} />
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-[#0a0a0a] transition-colors">
              <ShoppingBag size={18} strokeWidth={1.8} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span key={totalItems} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#dc2626] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Profile icon — mobile only */}
            {user ? (
              <Link href="/profile" className="lg:hidden p-2 text-gray-600 hover:text-[#0a0a0a] transition-colors">
                <User size={18} strokeWidth={1.8} />
              </Link>
            ) : (
              <Link href="/login" className="lg:hidden p-2 text-gray-600 hover:text-[#0a0a0a] transition-colors">
                <User size={18} strokeWidth={1.8} />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="border-t border-gray-100 overflow-hidden">
              <div className="max-w-[1400px] mx-auto px-6 py-3">
                <form onSubmit={e => { e.preventDefault(); router.push(`/products?search=${searchVal}`); setSearchOpen(false); }}
                  className="flex items-center gap-3">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search products, brands..."
                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-gray-400" />
                  <button type="submit" className="text-xs font-semibold text-[#dc2626] tracking-wider uppercase">Search</button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-4 space-y-1">
              <Link href="/" onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-bold text-gray-700 hover:text-[#dc2626] border-b border-gray-100">Home</Link>
              <Link href="/products" onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-bold text-gray-700 hover:text-[#dc2626] border-b border-gray-100">Products</Link>
              <Link href="/about" onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-bold text-gray-700 hover:text-[#dc2626] border-b border-gray-100">About Us</Link>
              {/* Mobile categories */}
              {categories.length > 0 && (
                <div className="border-b border-gray-100">
                  <p className="py-2.5 text-xs font-bold tracking-widest uppercase text-gray-400">Categories</p>
                  <div className="grid grid-cols-2 gap-1 pb-2">
                    {categories.map(cat => (
                      <Link key={cat._id} href={`/products?category=${cat.name}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-gray-600 hover:text-[#dc2626] py-1">{cat.name}</Link>
                    ))}
                  </div>
                </div>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm font-bold text-[#dc2626] border-b border-gray-100">Admin Panel</Link>
              )}
              <div className="pt-3 flex items-center justify-between">
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}
                      className="text-sm text-gray-600 flex items-center gap-1.5">
                      <User size={14} /> {user.name?.split(' ')[0]}
                    </Link>
                    <button onClick={handleLogout} className="text-xs text-[#dc2626] flex items-center gap-1">
                      <LogOut size={12} /> Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="text-sm font-semibold text-[#0a0a0a]">Sign In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
