'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, getAddresses, addAddress, deleteAddress, updateAddress, getProfile } from '@/lib/api';
import Link from 'next/link';
import { ChevronRight, Lock, Plus, Trash2, ShieldCheck, Truck, Tag, Edit2, Check, Banknote, Smartphone, Gift, PartyPopper } from 'lucide-react';
import Footer from '@/components/store/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, StaggerContainer, StaggerItem, ListItem, ScaleIn, SlideUp } from '@/components/Motion';

const STEPS = ['Address', 'Payment', 'Review', 'Confirm'];

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: <Banknote size={18} /> },
  { id: 'UPI', label: 'UPI', sub: 'Admin will contact you via WhatsApp', icon: <Smartphone size={18} /> },
];

// Sample coupons — replace with API call if needed
const VALID_COUPONS = [
  { code: 'FIRST10', type: 'percentage', value: 10, min: 500 },
  { code: 'FLAT200', type: 'flat', value: 200, min: 1000 },
];

export default function CheckoutPage() {
  const { cartItems, totalPrice, totalSavings, mrpTotal, clearCart, clearBuyNow } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const videoRef = useRef(null);

  // address
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [pendingSelectId, setPendingSelectId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addrLoading, setAddrLoading] = useState(true);
  const emptyAddr = { fullName: '', phone: '', address: '', city: '', pin: '', country: 'India' };
  const [shipping, setShipping] = useState(emptyAddr);
  const [editForm, setEditForm] = useState(emptyAddr);

  // payment
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const shippingCost = totalPrice > 999 ? 0 : 99;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round(totalPrice * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;
  const total = totalPrice + shippingCost - couponDiscount;
  const totalSaved = (mrpTotal - totalPrice) + (shippingCost === 0 ? 99 : 0) + couponDiscount;

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

  const handleSaveEdit = async (id) => {
    try {
      const res = await updateAddress(id, editForm);
      const updated = res.data || [];
      setSavedAddresses(updated);
      setEditingId(null);
    } catch { setError('Failed to update address'); }
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const found = VALID_COUPONS.find(c => c.code === couponInput.trim().toUpperCase());
    if (!found) return setCouponError('Invalid coupon code');
    if (totalPrice < found.min) return setCouponError(`Minimum order ₹${found.min} required`);
    setAppliedCoupon(found);
    setCouponInput('');
  };

  const handleConfirmSelect = () => {
    if (!pendingSelectId) return;
    setSelectedAddressId(pendingSelectId);
    setPendingSelectId(null);
    setShowNewForm(false);
  };

  const handleContinueToPayment = async () => {
    if (showNewForm) {
      if (Object.values(shipping).some(v => !v)) return setError('Please fill all address fields');
      try {
        const res = await addAddress(shipping);
        const newAddrs = res.data || [];
        setSavedAddresses(newAddrs);
        const newest = newAddrs[newAddrs.length - 1];
        setSelectedAddressId(newest._id);
        setShowNewForm(false);
        setShipping(emptyAddr);
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
        items: cartItems.map(i => ({ product: i._id, name: i.name, image: i.image, price: i.offerPrice || i.price, originalPrice: i.price, quantity: i.qty })),
        shippingAddress: activeShipping(),
        paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice: shippingCost,
        totalPrice: total,
        originalItemsPrice: mrpTotal,
        couponCode: appliedCoupon?.code || '',
        discount: couponDiscount,
      });
      clearCart();
      clearBuyNow();
      if (typeof window !== 'undefined') sessionStorage.setItem('lastOrderPaymentMethod', paymentMethod);
      setOrderPlaced(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

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

  if (cartItems.length === 0 && !orderPlaced) { router.replace('/products'); return null; }

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">

          {/* Step bar */}
          <SlideUp className="flex items-center gap-0 mb-8 border border-gray-200 w-fit overflow-hidden">
            {STEPS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-widest uppercase border-r last:border-r-0 transition-colors ${
                  i === step ? 'bg-[#0a0a0a] text-white' : i < step ? 'bg-[#dc2626] text-white cursor-pointer' : 'text-gray-400 bg-white'
                }`}
                onClick={() => i < step && setStep(i)}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                  i === step ? 'border-white text-white' : i < step ? 'border-white text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </motion.div>
            ))}
          </SlideUp>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* ── STEP 0: ADDRESS ── */}
              {step === 0 && (
                <ScaleIn className="border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Truck size={15} className="text-[#dc2626]" />
                    <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Select Delivery Address</p>
                  </div>
                  <div className="p-5">
                    {addrLoading ? (
                      <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-20 w-full" />)}</div>
                    ) : (
                      <>
                        {savedAddresses.length > 0 && (
                          <StaggerContainer className="space-y-3 mb-4">
                            {savedAddresses.map((addr, idx) => (
                              <StaggerItem key={addr._id}>
                                <div className={`border transition-colors ${
                                  selectedAddressId === addr._id && !showNewForm
                                    ? 'border-[#0a0a0a] bg-gray-50'
                                    : 'border-gray-200'
                                }`}>
                                {editingId === addr._id ? (
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                      {[['fullName','Full Name','sm:col-span-2','text'],['phone','Phone','sm:col-span-2','tel'],
                                        ['address','Street Address','sm:col-span-2','text'],['city','City','','text'],
                                        ['pin','PIN','','text'],['country','Country','','text']].map(([k,ph,span,t]) => (
                                        <input key={k} placeholder={ph} type={t} className={`${span} border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0a0a0a]`}
                                          value={editForm[k]} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => handleSaveEdit(addr._id)} className="flex items-center gap-1 text-xs font-bold bg-[#0a0a0a] text-white px-3 py-2"><Check size={12} /> Save</button>
                                      <button onClick={() => setEditingId(null)} className="text-xs font-bold text-gray-400 px-3 py-2 border border-gray-200">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-3 p-4 cursor-pointer"
                                    onClick={() => setPendingSelectId(addr._id)}>
                                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                      pendingSelectId === addr._id || (selectedAddressId === addr._id && !pendingSelectId && !showNewForm) ? 'border-[#0a0a0a]' : 'border-gray-300'
                                    }`}>
                                      {(pendingSelectId === addr._id || (selectedAddressId === addr._id && !pendingSelectId && !showNewForm)) && <div className="w-2 h-2 bg-[#0a0a0a] rounded-full" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-[#0a0a0a]">{addr.fullName} <span className="text-xs text-gray-400 font-normal ml-2">{addr.phone}</span></p>
                                      <p className="text-xs text-gray-500 mt-0.5">{addr.address}, {addr.city} — {addr.pin}, {addr.country}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <button onClick={e => { e.stopPropagation(); setEditingId(addr._id); setEditForm({ fullName: addr.fullName, phone: addr.phone, address: addr.address, city: addr.city, pin: addr.pin, country: addr.country }); }}
                                        className="p-1.5 text-gray-300 hover:text-[#0a0a0a] transition-colors"><Edit2 size={13} /></button>
                                      <button onClick={e => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                                        className="p-1.5 text-gray-300 hover:text-[#dc2626] transition-colors"><Trash2 size={13} /></button>
                                    </div>
                                  </div>
                                )}
                                </div>
                              </StaggerItem>
                            ))}
                            {pendingSelectId && (
                              <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleConfirmSelect}
                                className="w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-[#dc2626] transition-colors">
                                Confirm This Address
                              </motion.button>
                            )}
                          </StaggerContainer>
                        )}

                        {!showNewForm ? (
                          <button onClick={() => { setShowNewForm(true); setPendingSelectId(null); setSelectedAddressId(null); }}
                            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#dc2626] hover:text-[#b91c1c] transition-colors">
                            <Plus size={13} /> Add new address
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="border border-dashed border-gray-300 p-5">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">New Address</p>
                              {savedAddresses.length > 0 && (
                                <button onClick={() => { setShowNewForm(false); setSelectedAddressId(savedAddresses[0]._id); }}
                                  className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-[#0a0a0a]">Cancel</button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[['fullName','Full Name','sm:col-span-2','text'],['phone','Phone Number','sm:col-span-2','tel'],
                                ['address','Street Address','sm:col-span-2','text'],['city','City','','text'],
                                ['pin','PIN Code','','text'],['country','Country','','text']].map(([k,ph,span,t]) => (
                                <input key={k} placeholder={ph} type={t} className={`${span} border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0a0a0a] transition-colors`}
                                  value={shipping[k]} onChange={e => setShipping(s => ({ ...s, [k]: e.target.value }))} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                    {error && <p className="text-[#dc2626] text-xs font-semibold mt-3">{error}</p>}
                    <button onClick={handleContinueToPayment}
                      className="mt-5 w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#dc2626] transition-colors">
                      Continue to Payment →
                    </button>
                  </div>
                </ScaleIn>
              )}

              {/* ── STEP 1: PAYMENT ── */}
              {step === 1 && (
                <ScaleIn className="border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#dc2626]" />
                    <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Select Payment Method</p>
                  </div>
                  <StaggerContainer className="p-5 space-y-3">
                    {PAYMENT_METHODS.map((m, idx) => (
                      <StaggerItem key={m.id}>
                        <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                          paymentMethod === m.id ? 'border-[#0a0a0a] bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        <input type="radio" name="payment" value={m.id}
                          checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === m.id ? 'border-[#0a0a0a]' : 'border-gray-300'
                        }`}>
                          {paymentMethod === m.id && <div className="w-2 h-2 bg-[#0a0a0a] rounded-full" />}
                        </div>
                        <span className="text-gray-500">{m.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-[#0a0a0a]">{m.label}</p>
                          <p className="text-xs text-gray-400">{m.sub}</p>
                        </div>
                        </label>
                      </StaggerItem>
                    ))}
                    <button onClick={() => setStep(2)}
                      className="w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#dc2626] transition-colors mt-2">
                      Continue to Review →
                    </button>
                  </StaggerContainer>
                </ScaleIn>
              )}

              {/* ── STEP 2: REVIEW ── */}
              {step === 2 && (
                <>
                  {/* Delivery address summary */}
                  <ScaleIn delay={0} className="border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={15} className="text-[#dc2626]" />
                        <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Delivering to</p>
                      </div>
                      <button onClick={() => setStep(0)} className="text-[10px] font-bold tracking-widest uppercase text-[#dc2626] hover:text-[#b91c1c]">Change</button>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm font-bold text-[#0a0a0a]">{activeShipping().fullName} <span className="text-xs text-gray-400 font-normal ml-2">{activeShipping().phone}</span></p>
                      <p className="text-sm text-gray-500 mt-1">{activeShipping().address}, {activeShipping().city} — {activeShipping().pin}, {activeShipping().country}</p>
                    </div>
                  </ScaleIn>

                  {/* Payment summary */}
                  <ScaleIn delay={0.1} className="border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-[#dc2626]" />
                        <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Payment</p>
                      </div>
                      <button onClick={() => setStep(1)} className="text-[10px] font-bold tracking-widest uppercase text-[#dc2626] hover:text-[#b91c1c]">Change</button>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                        <span className="text-gray-500">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon}</span>
                        {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                      </div>
                    </div>
                  </ScaleIn>

                  {/* Order items */}
                  <ScaleIn delay={0.2} className="border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                      <Tag size={15} className="text-[#dc2626]" />
                      <p className="text-sm font-black tracking-tight text-[#0a0a0a]">Order Items ({cartItems.length})</p>
                    </div>
                    <StaggerContainer className="divide-y divide-gray-100">
                      {cartItems.map((item, idx) => {
                        const salePrice = item.offerPrice || item.price;
                        const mrp = item.originalPrice || item.price;
                        return (
                          <StaggerItem key={item._id}>
                            <div className="flex items-center gap-4 px-5 py-4">
                            <img src={item.image || 'https://placehold.co/64x64?text=...'} alt={item.name}
                              className="w-16 h-16 object-cover border border-gray-100 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#0a0a0a] leading-tight">{item.name}</p>
                              <p className="text-xs text-gray-400 mt-1">Qty: {item.qty}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs font-bold text-[#0a0a0a]">₹{salePrice.toLocaleString()}</p>
                                {mrp > salePrice && <p className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString()}</p>}
                              </div>
                            </div>
                            <p className="text-sm font-black text-[#0a0a0a] shrink-0">₹{(salePrice * item.qty).toLocaleString()}</p>
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
                  </ScaleIn>

                  {/* Coupon */}
                  <ScaleIn delay={0.3} className="border border-gray-200 p-5">
                    <p className="text-xs font-bold text-[#0a0a0a] mb-3 tracking-wide uppercase">Coupon Code</p>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3">
                        <p className="text-sm font-bold text-green-700 flex items-center gap-1.5"><PartyPopper size={14} /> {appliedCoupon.code} — ₹{couponDiscount} off applied</p>
                        <button onClick={() => setAppliedCoupon(null)} className="text-xs text-gray-400 hover:text-[#dc2626]">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Enter coupon code" value={couponInput}
                          onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a] uppercase tracking-wider" />
                        <button onClick={handleApplyCoupon}
                          className="bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase px-5 hover:bg-[#dc2626] transition-colors">
                          Apply
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-[#dc2626] text-xs mt-2">{couponError}</p>}
                  </ScaleIn>

                  <button onClick={() => setStep(3)}
                    className="w-full bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-[#dc2626] transition-colors">
                    Review Complete — Confirm Order →
                  </button>
                  {error && <p className="text-[#dc2626] text-xs font-semibold">{error}</p>}
                </>
              )}

              {/* ── STEP 3: CONFIRM ── */}
              {step === 3 && (
                <ScaleIn className="border border-gray-200 p-6 text-center space-y-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Final Order Summary</p>
                    <h2 className="font-black text-2xl text-[#0a0a0a]">Confirm Your Order</h2>
                    <p className="text-sm text-gray-500 mt-1">Please review before placing the order</p>
                  </div>
                  <div className="text-left border border-gray-100 divide-y divide-gray-100">
                    <div className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-gray-500">Items ({cartItems.reduce((s,i) => s+i.qty,0)})</span>
                      <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                        {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between px-4 py-3 text-sm">
                        <span className="text-green-600">Coupon ({appliedCoupon.code})</span>
                        <span className="text-green-600 font-semibold">- ₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-4 py-3">
                      <span className="font-black text-[#0a0a0a]">Total</span>
                      <span className="font-black text-xl text-[#0a0a0a]">₹{total.toLocaleString()}</span>
                    </div>
                    {totalSaved > 0 && (
                      <div className="px-4 py-3 bg-green-50">
                        <p className="text-sm font-bold text-green-700 flex items-center gap-1.5"><PartyPopper size={14} /> You Saved ₹{totalSaved.toLocaleString()} on this order!</p>
                      </div>
                    )}
                  </div>
                  <div className="text-left text-sm text-gray-500 space-y-1">
                    <p><span className="font-bold text-[#0a0a0a]">Ship to:</span> {activeShipping().fullName}, {activeShipping().address}, {activeShipping().city} — {activeShipping().pin}</p>
                    <p><span className="font-bold text-[#0a0a0a]">Pay via:</span> {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</p>
                  </div>
                  {error && <p className="text-[#dc2626] text-xs font-semibold">{error}</p>}
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className="w-full bg-[#dc2626] text-white text-sm font-black tracking-widest uppercase py-4 hover:bg-[#b91c1c] transition-colors disabled:opacity-50">
                    {loading ? 'Placing Order...' : '✓ Place Order Now'}
                  </button>
                  <button onClick={() => setStep(2)} className="text-xs text-gray-400 hover:text-[#0a0a0a]">← Go Back</button>
                </ScaleIn>
              )}
            </div>

            {/* ── PRICE SUMMARY SIDEBAR ── */}
            <aside className="w-full lg:w-80 shrink-0">
              <SlideUp delay={0.2} className="border border-gray-200 lg:sticky lg:top-24">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Price Details</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>MRP ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
                    <span>₹{mrpTotal.toLocaleString()}</span>
                  </div>
                  {mrpTotal > totalPrice && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Product Discount</span>
                      <span>- ₹{(mrpTotal - totalPrice).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Coupon</span>
                      <span>- ₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#0a0a0a]">Total Amount</span>
                    <span className="font-black text-xl text-[#0a0a0a]">₹{total.toLocaleString()}</span>
                  </div>
                  {totalSaved > 0 && (
                    <p className="text-[11px] text-green-600 font-semibold bg-green-50 px-3 py-2 flex items-center gap-1.5">
                      <PartyPopper size={12} /> You Saved ₹{totalSaved.toLocaleString()} on this order
                    </p>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck size={12} className="text-gray-400" />
                    <p className="text-[10px] text-gray-400">Safe & Secure Payments</p>
                  </div>
                </div>
              </SlideUp>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {/* ── ORDER SUCCESS MODAL ── */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative flex flex-col items-center gap-4 px-6">
              <video
                ref={videoRef}
                src="/orderplace.mp4"
                autoPlay
                muted
                playsInline
                onEnded={() => router.replace('/order-success')}
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center max-w-md">
                <p className="text-white font-black text-2xl tracking-tight">Order Placed Successfully!</p>
                {paymentMethod === 'UPI' ? (
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                    Our team will contact you on WhatsApp within 24 hours for the next payment process.
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">Taking you to your order summary...</p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
