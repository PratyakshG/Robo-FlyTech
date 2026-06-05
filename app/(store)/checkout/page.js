'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, getAddresses, addAddress, deleteAddress, getProfile } from '@/lib/api';
import Link from 'next/link';
import { ChevronRight, Lock, Plus, Trash2, ShieldCheck, Truck, Tag } from 'lucide-react';
import Footer from '@/components/store/Footer';

const STEPS = ['Address', 'Review & Pay'];

const PAYMENT_METHODS = [
  { id: 'COD',        label: 'Cash on Delivery',   sub: 'Pay when your order arrives',   icon: '💵' },
  { id: 'UPI',        label: 'UPI',                 sub: 'GPay, PhonePe, Paytm & more',   icon: '📱' },
  { id: 'Card',       label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay',       icon: '💳' },
  { id: 'NetBanking', label: 'Net Banking',          sub: 'All major banks supported',     icon: '🏦' },
];

export default function CheckoutPage() {
  const { cartItems, totalPrice, totalSavings, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // address
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [addrLoading, setAddrLoading] = useState(true);
  const [shipping, setShipping] = useState({ fullName: '', phone: '', address: '', city: '', pin: '', country: 'India' });

  // payment
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const shippingCost = totalPrice > 999 ? 0 : 99;
  const total = totalPrice + shippingCost;

  useEffect(() => {
    if (!user) return;
    getProfile().then(r => setShipping(s => ({ ...s, phone: r.data?.phone || '' }))).catch(() => {});
    getAddresses().then(r => {
      const addrs = r.data || [];
      setSavedAddresses(addrs);
      if (addrs.length > 0) { setSelectedAddressId(addrs[0]._id); setShowNewForm(false); }
      else setShowNewForm(true);
      setAddrLoading(false);
    }).catch(() => { setShowNewForm(true); setAddrLoading(false); });
  }, [user]);

  const activeShipping = () => {
    if (showNewForm || !selectedAddressId) return shipping;
    return savedAddresses.find(a => a._id === selectedAddressId) || shipping;
  };

  const handleDeleteAddress = async (id) => {
    const res = await deleteAddress(id);
    const remaining = res.data || [];
    setSavedAddresses(remaining);
    if (selectedAddressId === id) {
      if (remaining.length > 0) { setSelectedAddressId(remaining[0]._id); setShowNewForm(false); }
      else { setSelectedAddressId(null); setShowNewForm(true); }
    }
  };

  const handleContinueToReview = async () => {
    if (showNewForm) {
      if (Object.values(shipping).some(v => !v)) return setError('Please fill all fields');
      try {
        const res = await addAddress(shipping);
        const newAddrs = res.data || [];
        setSavedAddresses(newAddrs);
        const newest = newAddrs[newAddrs.length - 1];
        setSelectedAddressId(newest._id);
        setShowNewForm(false);
        setShipping({ fullName: '', phone: '', address: '', city: '', pin: '', country: 'India' });
      } catch { return setError('Failed to save address'); }
    } else {
      if (!selectedAddressId) return setError('Please select a delivery address');
    }
    setError('');
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true); setError('');
    try {
      await createOrder({
        items: cartItems.map(i => ({ product: i._id, name: i.name, image: i.image, price: i.offerPrice || i.price, quantity: i.qty })),
        shippingAddress: activeShipping(),
        paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice: shippingCost,
        totalPrice: total,
      });
      clearCart();
      router.push('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  // ── Not logged in ──
  if (!user) return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-16 flex flex-col items-center text-center gap-5">
          <Lock size={36} className="text-gray-300" />
          <h1 className="font-black text-2xl text-[#0a0a0a]">Login to continue</h1>
          <p className="text-sm text-gray-500">You need an account to place an order.</p>
          <Link href="/login" className="btn-primary px-8 py-3">Sign In →</Link>
        </div>
      </main>
      <Footer />
    </>
  );

  if (cartItems.length === 0) { router.push('/cart'); return null; }

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">
            <span>Cart</span><ChevronRight size={10} />
            <span className={step === 0 ? 'text-[#0a0a0a]' : 'text-gray-400'}>Address</span>
            <ChevronRight size={10} />
            <span className={step === 1 ? 'text-[#0a0a0a]' : 'text-gray-400'}>Review & Pay</span>
          </div>

          {/* Step bar */}
          <div className="flex items-center gap-0 mb-8 border border-gray-200 w-fit">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-widest uppercase border-r last:border-r-0 transition-colors ${
                i === step ? 'bg-[#0a0a0a] text-white' : i < step ? 'bg-[#dc2626] text-white cursor-pointer' : 'text-gray-400 bg-white'
              }`}
                onClick={() => i < step && setStep(i)}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                  i === step ? 'border-white text-white' : i < step ? 'border-white text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* ── STEP 0: ADDRESS ── */}
              {step === 0 && (
                <div className="border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Truck size={15} className="text-[#dc2626]" />
                    <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Select Delivery Address</p>
                  </div>
                  <div className="p-5">
                    {addrLoading ? (
                      <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
                    ) : (
                      <>
                        {/* Saved addresses */}
                        {savedAddresses.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {savedAddresses.map(addr => (
                              <div key={addr._id}
                                onClick={() => { setSelectedAddressId(addr._id); setShowNewForm(false); }}
                                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                                  selectedAddressId === addr._id && !showNewForm
                                    ? 'border-[#0a0a0a] bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}>
                                {/* Radio */}
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  selectedAddressId === addr._id && !showNewForm ? 'border-[#0a0a0a]' : 'border-gray-300'
                                }`}>
                                  {selectedAddressId === addr._id && !showNewForm && <div className="w-2 h-2 bg-[#0a0a0a] rounded-full" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-bold text-[#0a0a0a]">{addr.fullName}</p>
                                    <span className="text-xs text-gray-500">{addr.phone}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{addr.address}, {addr.city} — {addr.pin}</p>
                                  <p className="text-xs text-gray-400">{addr.country}</p>
                                </div>
                                <button onClick={e => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                                  className="p-1.5 text-gray-300 hover:text-[#dc2626] transition-colors shrink-0">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New address form toggle */}
                        {!showNewForm ? (
                          <button onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#dc2626] hover:text-[#b91c1c] transition-colors">
                            <Plus size={13} /> Add new address
                          </button>
                        ) : (
                          <div className="border border-dashed border-gray-300 p-5">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">New Address</p>
                              {savedAddresses.length > 0 && (
                                <button onClick={() => { setShowNewForm(false); setSelectedAddressId(savedAddresses[0]._id); }}
                                  className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-[#0a0a0a] transition-colors">
                                  Cancel
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                ['fullName', 'Full Name',      'sm:col-span-2', 'text'],
                                ['phone',    'Phone Number',   'sm:col-span-2', 'tel'],
                                ['address',  'Street Address', 'sm:col-span-2', 'text'],
                                ['city',     'City',           '', 'text'],
                                ['pin',      'PIN Code',       '', 'text'],
                                ['country',  'Country',        '', 'text'],
                              ].map(([k, ph, span, type]) => (
                                <input key={k} placeholder={ph} type={type}
                                  className={`${span} border border-gray-200 px-4 py-3 text-sm text-[#0a0a0a] placeholder:text-gray-400 outline-none focus:border-[#0a0a0a] transition-colors`}
                                  value={shipping[k]}
                                  onChange={e => setShipping(s => ({ ...s, [k]: e.target.value }))} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {error && <p className="text-[#dc2626] text-xs font-semibold mt-3">{error}</p>}
                    <button onClick={handleContinueToReview}
                      className="mt-5 w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#dc2626] transition-colors">
                      Continue to Review →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 1: REVIEW & PAY ── */}
              {step === 1 && (
                <>
                  {/* Delivery address summary */}
                  <div className="border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={15} className="text-[#dc2626]" />
                        <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Delivering to</p>
                      </div>
                      <button onClick={() => setStep(0)}
                        className="text-[10px] font-bold tracking-widest uppercase text-[#dc2626] hover:text-[#b91c1c] transition-colors">
                        Change
                      </button>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-bold text-[#0a0a0a]">{activeShipping().fullName}</p>
                        <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5">{activeShipping().phone}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{activeShipping().address}, {activeShipping().city} — {activeShipping().pin}, {activeShipping().country}</p>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                      <Tag size={15} className="text-[#dc2626]" />
                      <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Order Items ({cartItems.length})</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex items-center gap-4 px-5 py-4">
                          <img src={item.image || 'https://placehold.co/64x64?text=...'} alt={item.name}
                            className="w-16 h-16 object-cover border border-gray-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0a0a0a] leading-tight">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-1">Qty: {item.qty}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs font-bold text-[#0a0a0a]">₹{(item.offerPrice || item.price)?.toLocaleString()}</p>
                              {item.offerPrice && (
                                <p className="text-xs text-gray-400 line-through">₹{item.price?.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-black text-[#0a0a0a] shrink-0">
                            ₹{((item.offerPrice || item.price) * item.qty).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                      <ShieldCheck size={15} className="text-[#dc2626]" />
                      <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Payment Method</p>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(m => (
                        <label key={m.id}
                          className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                            paymentMethod === m.id ? 'border-[#0a0a0a] bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                          }`}>
                          <input type="radio" name="payment" value={m.id}
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id)}
                            className="sr-only" />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === m.id ? 'border-[#0a0a0a]' : 'border-gray-300'
                          }`}>
                            {paymentMethod === m.id && <div className="w-2 h-2 bg-[#0a0a0a] rounded-full" />}
                          </div>
                          <span className="text-lg leading-none">{m.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-[#0a0a0a]">{m.label}</p>
                            <p className="text-xs text-gray-400">{m.sub}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-[#dc2626] text-xs font-semibold">{error}</p>}
                </>
              )}
            </div>

            {/* ── PRICE SUMMARY SIDEBAR ── */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="border border-gray-200 lg:sticky lg:top-24">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Price Details</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Price ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Charges</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                  {shippingCost === 0 && (
                    <p className="text-[10px] text-green-600 font-medium">✓ Free delivery on orders over ₹999</p>
                  )}
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Discount</span>
                      <span>- ₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#0a0a0a]">Total Amount</span>
                    <span className="font-black text-xl text-[#0a0a0a]">₹{total.toLocaleString()}</span>
                  </div>
                  {(totalSavings > 0 || shippingCost === 0) && (
                    <p className="text-[11px] text-green-600 font-semibold">
                      You save ₹{(totalSavings + (shippingCost === 0 ? 99 : 0)).toLocaleString()} on this order
                    </p>
                  )}
                </div>

                {/* Place order button — only on review step */}
                {step === 1 && (
                  <div className="px-5 pb-5">
                    <button onClick={handlePlaceOrder} disabled={loading}
                      className="w-full bg-[#dc2626] text-white text-sm font-black tracking-widest uppercase py-4 hover:bg-[#b91c1c] transition-colors disabled:opacity-50">
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <ShieldCheck size={12} className="text-gray-400" />
                      <p className="text-[10px] text-gray-400">Safe & Secure Payments</p>
                    </div>
                  </div>
                )}

                {/* Continue button on address step */}
                {step === 0 && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <ShieldCheck size={12} className="text-gray-400" />
                      <p className="text-[10px] text-gray-400">Safe & Secure Payments</p>
                    </div>
                  </div>
                )}
              </div>
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
