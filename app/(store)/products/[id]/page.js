'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProduct, getProducts, getProductsWithOffers, getProductWithOffer } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Truck, RotateCcw, ShieldCheck, Star, Minus, Plus, Heart } from 'lucide-react';

const TABS = ['Specifications', 'Details', 'Reviews'];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [activeTab, setActiveTab]   = useState(0);
  const [activeImg, setActiveImg]   = useState(0);
  const { addToCart, updateQty, removeFromCart, cartItems, buyNow } = useCart();

  useEffect(() => {
    // Fetch product with offer applied in one reliable call
    getProductWithOffer(id).then(r => {
      setProduct(r.data);
      setActiveImg(0);
      // Fetch related with offers applied
      getProductsWithOffers({ limit: 0 }).then(offersRes => {
        const offerMap = {};
        (offersRes.data || []).forEach(p => { offerMap[String(p._id)] = p; });
        getProducts({ category: r.data.category, limit: 5 }).then(res => {
          const prods = (res.data.products || [])
            .filter(p => String(p._id) !== String(id))
            .slice(0, 4)
            .map(p => offerMap[String(p._id)] || p);
          setRelated(prods);
        });
      });
    });
  }, [id]);



  if (!product) return (
    <>
      <Navbar />
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">Loading product...</p>
        </div>
      </div>
    </>
  );

  const hasOffer     = product.offerPrice && product.offerPrice < product.price;
  const displayPrice = hasOffer ? product.offerPrice : product.price;
  // MRP: if offer active use base price, else use originalPrice (deal badge), else null
  const mrpPrice     = hasOffer
    ? (product.originalPrice || product.price)
    : (product.originalPrice && product.originalPrice > product.price ? product.originalPrice : null);
  const discountPct  = mrpPrice
    ? Math.round((1 - displayPrice / mrpPrice) * 100)
    : null;
  const savedAmount  = mrpPrice ? mrpPrice - displayPrice : 0;

  // Build specs from product.specifications array
  const specs = Array.isArray(product.specifications)
    ? product.specifications.filter(s => s.label && s.value)
    : [];

  // Images: use product.images array if available, else wrap single image
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://placehold.co/800x600?text=No+Image'];

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-8">
            <Link href="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/products" className="hover:text-[#0a0a0a] transition-colors">Products</Link>
            <ChevronRight size={10} />
            {product.category && (
              <>
                <Link href={`/products?category=${product.category}`} className="hover:text-[#0a0a0a] transition-colors">
                  {product.category}
                </Link>
                <ChevronRight size={10} />
              </>
            )}
            <span className="text-[#0a0a0a] truncate max-w-[200px]">{product.name}</span>
          </div>

          {/* ── MAIN PRODUCT SECTION ── */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">

            {/* LEFT — Images */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>

              {/* Main image */}
              <div className="relative overflow-hidden bg-gray-50 aspect-[4/3] mb-3">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* SKU tag */}
                {product.sku && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-1.5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
                      SKU / {product.sku}
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {discountPct && (
                    <span className="bg-[#dc2626] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
                      -{discountPct}%
                    </span>
                  )}
                  {product.offerBadge && (
                    <span className="bg-[#0a0a0a] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
                      {product.offerBadge}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="bg-gray-400 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 overflow-hidden border-2 transition-colors ${
                        activeImg === i ? 'border-[#0a0a0a]' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* RIGHT — Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col">

              {/* Brand + Category */}
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#dc2626] mb-3">
                {[product.brand, product.category].filter(Boolean).join(' · ')}
              </p>

              {/* Name */}
              <h1 className="font-black text-[2.4rem] tracking-[-0.03em] leading-[1.05] text-[#0a0a0a] mb-4">
                {product.name}
              </h1>

              {/* Rating row */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={13}
                        className={i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#0a0a0a]">{product.rating.toFixed(1)}</span>
                  {product.numReviews > 0 && (
                    <span className="text-xs text-gray-400">({product.numReviews} reviews)</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-black text-[2.2rem] tracking-[-0.03em] text-[#0a0a0a]">
                  ₹{displayPrice.toLocaleString()}
                </span>
                {mrpPrice && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    ₹{mrpPrice.toLocaleString()}
                  </span>
                )}
                {discountPct && (
                  <span className="text-sm font-bold text-[#dc2626]">{discountPct}% OFF</span>
                )}
              </div>
              {savedAmount > 0 && (
                <p className="text-sm font-bold text-green-600 mb-6">You Save ₹{savedAmount.toLocaleString()}</p>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-500 leading-relaxed mb-6 border-t border-gray-100 pt-6">
                  {product.description}
                </p>
              )}

              {/* Add to Cart / Qty stepper */}
              {product.stock > 0 ? (() => {
                const cartItem = cartItems.find(i => i._id === product._id);
                const qtyInCart = cartItem ? cartItem.qty : 0;
                return (
                  <div className="flex items-stretch gap-3 mb-4">
                    <AnimatePresence mode="wait">
                      {qtyInCart > 0 ? (
                        <motion.div key="stepper"
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
                          className="flex items-center border border-[#0a0a0a]">
                          <button
                            onClick={() => qtyInCart === 1 ? removeFromCart(product._id) : updateQty(product._id, qtyInCart - 1)}
                            className="w-12 h-12 flex items-center justify-center text-[#0a0a0a] hover:bg-gray-50 border-r border-[#0a0a0a] transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="w-14 text-center text-sm font-bold text-[#0a0a0a]">{qtyInCart}</span>
                          <button
                            onClick={() => updateQty(product._id, Math.min(product.stock, qtyInCart + 1))}
                            className="w-12 h-12 flex items-center justify-center text-[#0a0a0a] hover:bg-gray-50 border-l border-[#0a0a0a] transition-colors">
                            <Plus size={14} />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button key="add"
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
                          onClick={() => addToCart(product)}
                          className="flex-1 h-12 bg-[#0a0a0a] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#dc2626] transition-colors">
                          Add to Cart — ₹{displayPrice.toLocaleString()}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Wishlist */}
                    <button className="w-12 h-12 border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#dc2626] hover:text-[#dc2626] transition-colors">
                      <Heart size={16} />
                    </button>
                  </div>
                );
              })() : (
                <div className="h-12 flex items-center justify-center border border-gray-200 text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                  Out of Stock
                </div>
              )}

              {/* Buy Now */}
              {product.stock > 0 && (
                <button
                  onClick={() => { buyNow(product); router.push('/checkout'); }}
                  className="h-12 border border-[#0a0a0a] flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition-colors mb-6 w-full">
                  Buy Now
                </button>
              )}

              {/* Perks */}
              <div className={`grid grid-cols-${[true, product.warrantyEnabled, product.returnsEnabled].filter(Boolean).length > 2 ? 3 : 2} border border-gray-100 divide-x divide-gray-100 mb-6`}>
                <div className="flex flex-col items-center gap-1.5 py-4 px-2 text-center">
                  <Truck size={16} className="text-gray-400" />
                  <p className="text-[11px] font-bold text-[#0a0a0a]">{product.freeShipping ? 'Free Shipping' : 'Fast Shipping'}</p>
                  <p className="text-[10px] text-gray-400">{product.freeShipping ? 'No extra charges' : 'Quick delivery'}</p>
                </div>
                {product.warrantyEnabled && (
                  <div className="flex flex-col items-center gap-1.5 py-4 px-2 text-center">
                    <ShieldCheck size={16} className="text-gray-400" />
                    <p className="text-[11px] font-bold text-[#0a0a0a]">Warranty</p>
                    <p className="text-[10px] text-gray-400">{product.warrantyDuration} {product.warrantyUnit}</p>
                  </div>
                )}
                {product.returnsEnabled && (
                  <div className="flex flex-col items-center gap-1.5 py-4 px-2 text-center">
                    <RotateCcw size={16} className="text-gray-400" />
                    <p className="text-[11px] font-bold text-[#0a0a0a]">Easy Returns</p>
                    <p className="text-[10px] text-gray-400">{product.returnDays || 7} days return</p>
                  </div>
                )}
              </div>

              {/* Stock indicator */}
              {product.stock <= 10 && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-gray-300' : 'bg-[#dc2626]'}`} />
                  <span className="text-xs font-semibold text-[#0a0a0a]">
                    {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} left`}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── TABS ── */}
          <div className="border-t border-gray-200 mb-12">
            <div className="flex gap-8">
              {TABS.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)}
                  className={`py-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${
                    activeTab === i
                      ? 'border-[#dc2626] text-[#dc2626]'
                      : 'border-transparent text-gray-400 hover:text-[#0a0a0a]'
                  }`}>
                  {tab}{tab === 'Reviews' && product.numReviews ? ` (${product.numReviews})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-20">

              {/* Specifications */}
              {activeTab === 0 && (
                specs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 border-l border-t border-gray-200">
                    {specs.map(({ label, value }) => (
                      <div key={label} className="border-r border-b border-gray-200 p-6">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">{label}</p>
                        <p className="text-sm font-semibold text-[#0a0a0a]">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-8">No specifications added for this product yet.</p>
                )
              )}

              {/* Details */}
              {activeTab === 1 && (
                <div className="max-w-2xl">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description || 'No additional details available.'}
                  </p>
                </div>
              )}

              {/* Reviews */}
              {activeTab === 2 && (
                <div className="flex flex-col items-center py-16 gap-4 text-center">
                  <div className="flex gap-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="font-black text-4xl text-[#0a0a0a]">{(product.rating || 4.5).toFixed(1)}</p>
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">Patient Rating</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── RELATED PRODUCTS ── */}
          {related.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between mb-8">
                <h2 className="font-black text-[2rem] tracking-[-0.03em] text-[#0a0a0a]">You may also like</h2>
                <Link href={`/products?category=${product.category}`}
                  className="text-sm text-gray-500 hover:text-[#0a0a0a] transition-colors">
                  View more →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-gray-200">
                {related.map((p, i) => (
                  <motion.div key={p._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-r border-b border-gray-200">
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
