'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';
import { MessageCircle } from 'lucide-react';

const SOCIALS = [
  {
    label: 'YouTube',
    href: 'https://youtube.com/@roboflytech?si=SzmUnnf_rKqPaKvl',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/roboflytech?igsh=ZjA1eGhvcGV4ZWU1',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.336-3.608-1.311C2.499 19.466 2.225 18.199 2.163 16.833 2.105 15.567 2.094 15.187 2.094 12s.011-3.584.069-4.85c.062-1.366.336-2.633 1.311-3.608C4.449 2.499 5.716 2.225 7.082 2.163 8.348 2.105 8.728 2.094 12 2.094zm0-2.163C8.741 0 8.332.013 7.052.072 5.197.157 3.355.635 1.924 2.066.493 3.497.015 5.339-.07 7.194-.13 8.474-.143 8.883-.143 12c0 3.117.013 3.526.072 4.806.085 1.855.563 3.697 1.994 5.128 1.431 1.431 3.273 1.909 5.128 1.994C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.855-.085 3.697-.563 5.128-1.994 1.431-1.431 1.909-3.273 1.994-5.128.059-1.28.072-1.689.072-4.806 0-3.117-.013-3.526-.072-4.806-.085-1.855-.563-3.697-1.994-5.128C20.645.635 18.803.157 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/18gxT5grFn/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/parth-gupta-9858b1411?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

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
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">

        {/* Brand + Socials */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.jpeg" alt="Robo Flytech" className="h-8 w-8 object-contain" />
            <span className="font-black text-sm tracking-widest uppercase">Robo Flytech</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Premium drones, RC cars, gadgets & accessories. Built for performance.
          </p>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-2">FOLLOW US</p>
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors">
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-3">SHOP</p>
          <div className="space-y-2">
            {visibleCats.map(c => (
              <Link key={c._id} href={`/products?category=${c.name}`}
                className="block text-sm text-gray-400 hover:text-white transition-colors">{c.name}</Link>
            ))}
            {categories.length > LIMIT && (
              <button onClick={() => setShowAll(v => !v)}
                className="text-xs font-semibold text-[#dc2626] hover:text-red-400 transition-colors mt-1">
                {showAll ? 'Show less ↑' : `+${categories.length - LIMIT} more ↓`}
              </button>
            )}
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-3">COMPANY</p>
          <div className="space-y-2">
            <Link href="/" className="block text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="block text-sm text-gray-400 hover:text-white transition-colors">About Us</Link>
            <Link href="/products" className="block text-sm text-gray-400 hover:text-white transition-colors">Products</Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-3">SUPPORT</p>
          <div className="space-y-2">
            <a href="https://wa.me/918765034655" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <MessageCircle size={14} className="text-[#25D366]" />
              WhatsApp Support
            </a>
            <p className="text-xs text-gray-600">Message us anytime for instant help</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <p className="text-[11px] text-gray-600 tracking-widest uppercase">
              © 2026 ROBO FLYTECH / ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] text-gray-700 mt-1">
              Developed by <span className="text-[#dc2626] font-semibold">Aditya Singh</span>
            </p>
          </div>
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
