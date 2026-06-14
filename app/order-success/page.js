'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Package, CheckCheck, Smartphone, AlertCircle } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [shippingPending, setShippingPending] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPaymentMethod(sessionStorage.getItem('lastOrderPaymentMethod'));
      setShippingPending(sessionStorage.getItem('shippingChargesPending') === 'true');
    }
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lastOrderPaymentMethod');
        sessionStorage.removeItem('shippingChargesPending');
      }
    };
  }, []);

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
          
          {shippingPending && (
            <div className="text-sm text-amber-700 leading-relaxed mb-4 bg-amber-50 border border-amber-200 p-4 rounded">
              <div className="flex items-center gap-2 font-bold text-[#0a0a0a] mb-2">
                <AlertCircle size={16} className="text-amber-600" />
                <span>Delivery Charges Pending</span>
              </div>
              <p className="text-sm">
                Your delivery charges will be calculated and updated within 1-2 hours based on your location. The final order total will be updated accordingly. You can track this in your order details.
              </p>
            </div>
          )}
          
          {paymentMethod === 'UPI' ? (
            <div className="text-sm text-gray-600 leading-relaxed mb-8 bg-blue-50 border border-blue-200 p-4 rounded">
              <div className="flex items-center gap-2 font-bold text-[#0a0a0a] mb-2">
                <Smartphone size={16} className="text-blue-600" />
                <span>Payment via UPI</span>
              </div>
              <p className="text-sm">
                Our team will contact you on WhatsApp within 24 hours for the payment process. Please keep your phone accessible.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Thank you for your purchase. We'll process and ship your order shortly. You'll receive a confirmation soon.
            </p>
          )}

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
