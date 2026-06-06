'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 4;

  useEffect(() => {
    getCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  const visibleCats = showAll ? categories : categories.slice(0, LIMIT);

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">

        {/* Shop */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">SHOP</p>
          <div className="space-y-2.5">
            {visibleCats.map(c => (
              <Link key={c._id} href={`/products?category=${c.name}`}
                className="block text-sm text-gray-400 hover:text-white transition-colors">{c.name}</Link>
            ))}
            {categories.length > LIMIT && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="text-xs font-semibold text-[#dc2626] hover:text-red-400 transition-colors flex items-center gap-1 mt-1">
                {showAll ? 'Show less ↑' : `+${categories.length - LIMIT} more ↓`}
              </button>
            )}
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">COMPANY</p>
          <div className="space-y-2.5">
            <Link href="/" className="block text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="block text-sm text-gray-400 hover:text-white transition-colors">About Us</Link>
            <Link href="/products" className="block text-sm text-gray-400 hover:text-white transition-colors">Products</Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-4">SUPPORT</p>
          <div className="space-y-2.5">
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <span className="text-[#25D366] text-base">💬</span>
              24×7 WhatsApp Support
            </a>
            <p className="text-xs text-gray-600">Message us anytime for instant help</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-600 tracking-widest uppercase">
            © 2026 ROBO FLYTECH / ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            {['PRIVACY', 'TERMS', 'COOKIES'].map(l => (
              <Link key={l} href="#"
                className="text-[11px] text-gray-600 hover:text-white tracking-widest uppercase transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
