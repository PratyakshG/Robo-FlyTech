'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getProductFilters, getProductsWithOffers } from '@/lib/api';
import ProductCard from '@/components/store/ProductCard';
import Navbar from '@/components/store/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import Footer from '@/components/store/Footer';

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // filter meta from API
  const [categories, setCategories]     = useState([]);
  const [brands, setBrands]             = useState([]);
  const [priceRange, setPriceRange]     = useState({ min: 0, max: 200000 });

  // active filters
  const [category, setCategory]         = useState(searchParams.get('category') || 'All');
  const [search, setSearch]             = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput]   = useState(searchParams.get('search') || '');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice]         = useState(null); // null = not set yet
  const [displayPrice, setDisplayPrice] = useState(null); // tracks slider UI without triggering fetch
  const [sort, setSort]                 = useState('featured');
  const [page, setPage]                 = useState(1);
  const [pages, setPages]               = useState(1);
  const [total, setTotal]               = useState(0);
  const [filterOpen, setFilterOpen]     = useState(false);

  // Load filter metadata once
  useEffect(() => {
    getProductFilters().then(r => {
      const data = r.data;
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setPriceRange(data.priceRange || { min: 0, max: 200000 });
      const max = data.priceRange?.max || 200000;
      setMaxPrice(max);
      setDisplayPrice(max);
      setFiltersLoading(false);
    }).catch(() => setFiltersLoading(false));
  }, []);

  // Load products whenever filters change
  useEffect(() => {
    if (maxPrice === null) return;
    setLoading(true);
    const params = { page, limit: 12 };
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(',');
    if (maxPrice < priceRange.max) params.maxPrice = maxPrice;

    Promise.all([getProducts(params), getProductsWithOffers()]).then(([filtered, withOffers]) => {
      const offerMap = {};
      (withOffers.data || []).forEach(p => { offerMap[p._id] = p; });
      let prods = (filtered.data.products || []).map(p => offerMap[p._id] || p);
      if (sort === 'price-asc')  prods = [...prods].sort((a, b) => (a.offerPrice||a.price) - (b.offerPrice||b.price));
      if (sort === 'price-desc') prods = [...prods].sort((a, b) => (b.offerPrice||b.price) - (a.offerPrice||a.price));
      if (sort === 'rating')     prods = [...prods].sort((a, b) => (b.rating||0) - (a.rating||0));
      setProducts(prods);
      setPages(filtered.data.pages || 1);
      setTotal(filtered.data.total || prods.length);
      setLoading(false);
    });
  }, [category, search, page, selectedBrands, maxPrice, sort]);

  const toggleBrand = (brand) =>
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );

  const clearAll = () => {
    setSelectedBrands([]);
    setMaxPrice(priceRange.max);
    setDisplayPrice(priceRange.max);
    setCategory('All');
    setPage(1);
  };

  const totalCategories = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">
            <span>Home</span>
            <ChevronRight size={10} />
            <span>Shop</span>
            <ChevronRight size={10} />
            <span className="text-[#0a0a0a]">{category === 'All' ? 'All Products' : category}</span>
          </div>

          {/* Page header with search */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <p className="section-label mb-1">[ CATALOGUE / {String(total).padStart(3, '0')} ITEMS ]</p>
                <h1 className="font-black text-[2rem] md:text-[3.5rem] tracking-[-0.04em] leading-none text-[#0a0a0a]">
                  {category === 'All' ? 'All Products' : category}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 border border-gray-200 px-3 py-2 text-xs font-bold tracking-widest uppercase hover:border-[#0a0a0a] transition-colors">
                  <SlidersHorizontal size={13} /> Filters
                </button>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="border border-gray-200 text-xs font-semibold tracking-widest uppercase px-3 md:px-4 py-2.5 bg-white text-[#0a0a0a] cursor-pointer hover:border-[#0a0a0a] transition-colors outline-none">
                  <option value="featured">FEATURED</option>
                  <option value="price-asc">PRICE: LOW–HIGH</option>
                  <option value="price-desc">PRICE: HIGH–LOW</option>
                  <option value="rating">TOP RATED</option>
                </select>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products by name, brand, or category..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
                  className="flex-1 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-gray-400"
                />
                <button
                  onClick={() => { setSearch(searchInput); setPage(1); }}
                  className="bg-[#0a0a0a] text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#dc2626] transition-colors">
                  Search
                </button>
                {search && (
                  <button
                    onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                    className="border border-gray-200 px-4 py-3 text-xs font-bold tracking-widest uppercase hover:border-[#0a0a0a] transition-colors">
                    Clear
                  </button>
                )}
              </div>
              {search && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing results for: <span className="font-bold text-[#0a0a0a]">"{search}"</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-8">

            {/* ── SIDEBAR desktop ── */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="border border-gray-200 p-5 sticky top-24">

                {/* Category */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Category</p>
                  {filtersLoading ? (
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {/* All option */}
                      <button onClick={() => { setCategory('All'); setPage(1); }}
                        className={`w-full flex items-center justify-between py-1.5 text-sm transition-colors text-left ${
                          category === 'All' ? 'text-[#dc2626] font-bold' : 'text-gray-600 hover:text-[#0a0a0a] font-medium'
                        }`}>
                        <span>All</span>
                        <span className="text-xs text-gray-400">{totalCategories}</span>
                      </button>
                      {categories.map(c => (
                        <button key={c.name} onClick={() => { setCategory(c.name); setPage(1); }}
                          className={`w-full flex items-center justify-between py-1.5 text-sm transition-colors text-left ${
                            category === c.name ? 'text-[#dc2626] font-bold' : 'text-gray-600 hover:text-[#0a0a0a] font-medium'
                          }`}>
                          <span>{c.name}</span>
                          <span className="text-xs text-gray-400">{c.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brand */}
                <div className="border-t border-gray-100 pt-5 mb-6">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Brand</p>
                  {filtersLoading ? (
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {brands.map(b => (
                        <label key={b.name} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b.name)}
                            onChange={() => toggleBrand(b.name)}
                            className="w-3.5 h-3.5 border border-gray-300 cursor-pointer accent-[#dc2626]"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-[#0a0a0a] transition-colors flex-1">
                            {b.name}
                          </span>
                          <span className="text-[11px] text-gray-400">{b.count}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Max Price */}
                <div className="border-t border-gray-100 pt-5 mb-6">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Max Price</p>
                  {filtersLoading || maxPrice === null ? (
                    <div className="skeleton h-5 w-full" />
                  ) : (
                    <>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        step={Math.max(100, Math.floor((priceRange.max - priceRange.min) / 100))}
                        value={displayPrice ?? maxPrice}
                        onChange={e => setDisplayPrice(Number(e.target.value))}
                        onMouseUp={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                        onTouchEnd={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                        className="w-full cursor-pointer"
                        style={{ accentColor: '#dc2626' }}
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-[11px] text-gray-400">₹{priceRange.min.toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-[#dc2626]">₹{(displayPrice ?? maxPrice).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={clearAll}
                  className="w-full border border-[#0a0a0a] py-2.5 text-xs font-bold tracking-widest uppercase text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors">
                  Clear All
                </button>
              </div>
            </aside>

            {/* ── SIDEBAR mobile drawer ── */}
            <AnimatePresence>
              {filterOpen && (
                <>
                  <motion.div key="overlay"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setFilterOpen(false)}
                    className="fixed inset-0 bg-black/40 z-50 lg:hidden" />
                  <motion.div key="drawer"
                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                    transition={{ type: 'tween', duration: 0.25 }}
                    className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 overflow-y-auto lg:hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-200">
                      <p className="text-xs font-bold tracking-widest uppercase">Filters</p>
                      <button onClick={() => setFilterOpen(false)}><X size={18} /></button>
                    </div>
                    <div className="p-5">
                      {/* Category */}
                      <div className="mb-6">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Category</p>
                        <div className="space-y-0.5">
                          <button onClick={() => { setCategory('All'); setPage(1); setFilterOpen(false); }}
                            className={`w-full flex items-center justify-between py-1.5 text-sm text-left ${
                              category === 'All' ? 'text-[#dc2626] font-bold' : 'text-gray-600 font-medium'
                            }`}>
                            <span>All</span><span className="text-xs text-gray-400">{categories.reduce((s,c)=>s+c.count,0)}</span>
                          </button>
                          {categories.map(c => (
                            <button key={c.name} onClick={() => { setCategory(c.name); setPage(1); setFilterOpen(false); }}
                              className={`w-full flex items-center justify-between py-1.5 text-sm text-left ${
                                category === c.name ? 'text-[#dc2626] font-bold' : 'text-gray-600 font-medium'
                              }`}>
                              <span>{c.name}</span><span className="text-xs text-gray-400">{c.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Brand */}
                      <div className="border-t border-gray-100 pt-5 mb-6">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Brand</p>
                        <div className="space-y-2">
                          {brands.map(b => (
                            <label key={b.name} className="flex items-center gap-2.5 cursor-pointer">
                              <input type="checkbox" checked={selectedBrands.includes(b.name)}
                                onChange={() => toggleBrand(b.name)}
                                className="w-3.5 h-3.5 accent-[#dc2626]" />
                              <span className="text-sm text-gray-600 flex-1">{b.name}</span>
                              <span className="text-[11px] text-gray-400">{b.count}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* Price */}
                      <div className="border-t border-gray-100 pt-5 mb-6">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Max Price</p>
                        {maxPrice !== null && (
                          <>
                            <input type="range" min={priceRange.min} max={priceRange.max}
                              step={Math.max(100, Math.floor((priceRange.max - priceRange.min) / 100))}
                              value={displayPrice ?? maxPrice}
                              onChange={e => setDisplayPrice(Number(e.target.value))}
                              onMouseUp={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                              onTouchEnd={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                              className="w-full cursor-pointer" style={{ accentColor: '#dc2626' }} />
                            <div className="flex justify-between mt-2">
                              <span className="text-[11px] text-gray-400">₹{priceRange.min.toLocaleString()}</span>
                              <span className="text-[11px] font-bold text-[#dc2626]">₹{(displayPrice ?? maxPrice).toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <button onClick={() => { clearAll(); setFilterOpen(false); }}
                        className="w-full border border-[#0a0a0a] py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#0a0a0a] hover:text-white transition-colors">
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ── PRODUCT GRID ── */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 *:border *:border-gray-200 *:rounded-xl *:overflow-clip">
                  {Array(9).fill(0).map((_, i) => (
                    <div key={i} className="border-r border-b border-gray-200">
                      <div className="skeleton h-64 w-full" />
                      <div className="p-4 space-y-2">
                        <div className="skeleton h-3 w-16" />
                        <div className="skeleton h-4 w-full" />
                        <div className="skeleton h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 text-gray-400">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="font-black text-xl text-[#0a0a0a] mb-2">No products found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5 *:border *:border-gray-200 *:rounded-xl *:overflow-clip">
                    {products.map((p, i) => (
                      <motion.div key={p._id}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-r border-b border-gray-200">
                        <ProductCard product={p} index={i} />
                      </motion.div>
                    ))}
                  </div>

                  {pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-xs border border-gray-200 font-semibold text-gray-500 disabled:opacity-30 hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors">
                        ← Prev
                      </button>
                      {Array.from({ length: pages }, (_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)}
                          className={`w-9 h-9 text-xs border font-bold transition-all ${
                            page === i + 1
                              ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#0a0a0a]'
                          }`}>
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(pages, p + 1))}
                        disabled={page === pages}
                        className="px-4 py-2 text-xs border border-gray-200 font-semibold text-gray-500 disabled:opacity-30 hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors">
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
