'use client';
import Link from 'next/link';
import Navbar from '@/components/store/Navbar';
import { useCart } from '@/context/CartContext';
import { PageTransition } from '@/components/Motion';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProduct } from '@/lib/api';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, totalPrice, mrpTotal, clearCart } = useCart();
  const [productsFreeShipping, setProductsFreeShipping] = useState(null);

  useEffect(() => {
    const fetchProductShipping = async () => {
      if (cartItems.length === 0) return;
      const shippingMap = {};
      for (const item of cartItems) {
        try {
          const response = await getProduct(item._id);
          shippingMap[item._id] = response.data.freeShipping === true;
        } catch {
          shippingMap[item._id] = false;
        }
      }
      setProductsFreeShipping(shippingMap);
    };
    fetchProductShipping();
  }, [JSON.stringify(cartItems.map(i => i._id))]);

  const allFreeShipping = productsFreeShipping && cartItems.length > 0 && cartItems.every(item => productsFreeShipping[item._id] === true);

  if (cartItems.length === 0) return (
    <>
      <Navbar />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-5 px-4 sm:px-6">
        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">
          <ShoppingCart size={32} className="text-gray-300" />
        </div>
        <h2 className="font-black text-2xl tracking-tight text-[#0a0a0a]">Your cart is empty</h2>
        <p className="text-sm text-gray-400">Add some products to get started</p>
        <Link href="/products" className="btn-primary px-8 py-3 flex items-center gap-2">
          <ShoppingBag size={14} /> Browse Products
        </Link>
      </motion.div>
    </>
  );



  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="bg-white min-h-screen overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto w-full min-w-0 px-4 sm:px-6 py-6 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6 sm:mb-8">
              <div className="min-w-0">
                <p className="section-label mb-1">[ CART ]</p>
                <h1 className="font-black text-xl sm:text-[2rem] tracking-[-0.03em] text-[#0a0a0a]">Shopping Cart</h1>
              </div>
              <span className="text-xs text-gray-400 tracking-widest uppercase shrink-0">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {/* Items */}
              <div className="lg:col-span-2 space-y-3 min-w-0 w-full">
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 p-3 sm:p-4 flex flex-col xs:flex-row gap-3 sm:gap-4 hover:border-[#0a0a0a] transition-colors w-full min-w-0 overflow-hidden">
                      <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
                        <img src={item.image || 'https://placehold.co/80x80?text=No+Img'} alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5 truncate">{item.brand}</p>
                          <h3 className="font-bold text-sm text-[#0a0a0a] line-clamp-2 sm:truncate">{item.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <p className="text-[#0a0a0a] font-black">₹{(item.offerPrice || item.price).toLocaleString()}</p>
                            {item.offerPrice && (
                              <p className="text-xs text-gray-400 line-through">₹{item.price.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between shrink pl-0 sm:pl-[4.25rem]">
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-300 hover:text-[#dc2626] transition-colors sm:order-first">
                          <Trash2 size={15} />
                        </motion.button>
                        <div className="flex items-center border border-[#0a0a0a]">
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => item.qty > 1 ? updateQty(item._id, item.qty - 1) : removeFromCart(item._id)}
                            className="w-8 h-8 flex items-center justify-center text-[#0a0a0a] hover:bg-gray-100 border-r border-[#0a0a0a] text-base">
                            −
                          </motion.button>
                          <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => updateQty(item._id, Math.min(item.stock || 99, item.qty + 1))}
                            className="w-8 h-8 flex items-center justify-center text-[#0a0a0a] hover:bg-gray-100 border-l border-[#0a0a0a] text-base">
                            +
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button onClick={clearCart}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#dc2626] transition-colors mt-2">
                  <Trash2 size={13} /> Clear all items
                </button>
              </div>

              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 p-4 sm:p-5 h-fit w-full min-w-0 lg:sticky lg:top-24">
                <h2 className="font-black text-base tracking-tight text-[#0a0a0a] mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {mrpTotal > totalPrice && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>MRP</span>
                      <span className="line-through">₹{mrpTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {mrpTotal > totalPrice && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Discount</span>
                      <span>- ₹{(mrpTotal - totalPrice).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    {!productsFreeShipping ? (
                      <span className="text-gray-400 text-xs">Loading...</span>
                    ) : allFreeShipping ? (
                      <span className="text-[#0a0a0a] font-semibold flex items-center gap-1"><Truck size={12} /> FREE</span>
                    ) : (
                      <span className="text-amber-600 text-xs">Will be updated in 1-2 hours</span>
                    )}
                  </div>
                  {!allFreeShipping && productsFreeShipping && (
                    <p className="text-xs text-amber-600">
                      Charges will be calculated based on your location
                    </p>
                  )}

                  <hr className="classic-divider" />
                  <div className="flex justify-between font-black text-[#0a0a0a]">
                    <span>Total</span>
                    <span className="text-lg">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {!allFreeShipping && productsFreeShipping && (
                    <p className="text-xs text-amber-600 mt-1">
                      * Final amount will be updated after shipping calculation
                    </p>
                  )}

                </div>
                <Link href="/checkout"
                  className="btn-primary w-full py-3 mt-5 flex items-center justify-center gap-2">
                  Checkout <ArrowRight size={14} />
                </Link>
                <Link href="/products"
                  className="block text-center text-xs text-gray-400 hover:text-[#dc2626] tracking-wide mt-3">
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      </PageTransition>
    </>
  );
}
