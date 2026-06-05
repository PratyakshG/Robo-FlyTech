'use client';
import Link from 'next/link';
import { ShoppingBag, Package, CheckCheck } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#0a0a0a] flex items-center justify-center mx-auto mb-6">
            <CheckCheck size={32} className="text-white" />
          </div>

          <p className="section-label mb-3">[ ORDER CONFIRMED ]</p>
          <h1 className="font-black text-[2.5rem] tracking-[-0.04em] leading-none text-[#0a0a0a] mb-4">
            Order placed<br />successfully!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Thank you for your purchase. We'll process and ship your order shortly. You'll receive a confirmation soon.
          </p>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-8" />

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products"
              className="flex items-center justify-center gap-2 bg-[#0a0a0a] text-white px-7 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#dc2626] transition-colors">
              <ShoppingBag size={14} /> Continue Shopping
            </Link>
            <Link href="/profile"
              className="flex items-center justify-center gap-2 border border-[#0a0a0a] text-[#0a0a0a] px-7 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#0a0a0a] hover:text-white transition-colors">
              <Package size={14} /> Track Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
