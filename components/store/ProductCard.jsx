"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Minus, Share2, Check, Copy } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product, index }) {
  const { addToCart, updateQty, removeFromCart, cartItems } = useCart();
  const { showToast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const cartItem = cartItems.find((i) => i._id === product._id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  const handleAdd = () => {
    addToCart(product);
    showToast(`${product.name} added to cart`);
  };
  const handleDecrease = () => {
    if (qtyInCart === 1) removeFromCart(product._id);
    else updateQty(product._id, qtyInCart - 1);
  };

  const isNew =
    product.createdAt &&
    Date.now() - new Date(product.createdAt) < 7 * 24 * 60 * 60 * 1000;
  const isDeal = product.originalPrice && product.originalPrice > product.price;
  const hasOffer = product.offerPrice && product.offerPrice < product.price;
  const displayPrice = hasOffer ? product.offerPrice : product.price;
  const displayOriginal = hasOffer
    ? product.price
    : isDeal
      ? product.originalPrice
      : null;
  const discountPct = hasOffer
    ? Math.round((1 - product.offerPrice / product.price) * 100)
    : isDeal
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  return (
    <>
      <div className="bg-white group flex flex-col hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <Link
          href={`/products/${product._id}`}
          className="block relative overflow-hidden bg-gray-50 aspect-square"
        >
        <img
          src={product.image || "https://placehold.co/400x320?text=No+Image"}
          alt={product.name}
          className="aspect-square object-contain group-hover:scale-110 transition-transform duration-300"
        />
        {/* Top-left badge — only New and discount % */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && <span className="badge-new">New</span>}
          {discountPct && <span className="badge-deal">-{discountPct}%</span>}
        </div>
        {/* Top-right share button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowShareModal(true);
            setCopied(false);
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors opacity-0 group-hover:opacity-100">
          <Share2 size={12} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand + Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
            {product.brand}
          </span>
          <div className="flex items-center gap-1">
            <Star
              size={10}
              className="text-amber-400 fill-amber-400"
            />
            <span className="text-[11px] font-semibold text-gray-600">
              {(product.rating || 4.5).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Name */}
        <Link
          href={`/products/${product._id}`}
          className="flex-1"
        >
          <h3 className="text-xs font-bold text-[#0a0a0a] leading-snug line-clamp-2 group-hover:text-[#dc2626] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Tagline */}
        {product.description && (
          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price row + Add button */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <AnimatePresence mode="wait">
            {qtyInCart > 0 ? (
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-1"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="text-sm font-bold text-[#0a0a0a] truncate">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {displayOriginal && (
                    <span className="text-[10px] text-gray-400 line-through shrink-0">
                      ₹{displayOriginal.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center border border-[#0a0a0a] shrink-0">
                  <button
                    onClick={handleDecrease}
                    className="w-6 h-6 flex items-center justify-center text-[#0a0a0a] hover:bg-gray-100 border-r border-[#0a0a0a]"
                  >
                    <Minus size={9} />
                  </button>
                  <span className="w-5 text-center text-[11px] font-bold text-[#0a0a0a]">
                    {qtyInCart}
                  </span>
                  <button
                    onClick={handleAdd}
                    className="w-6 h-6 flex items-center justify-center text-[#0a0a0a] hover:bg-gray-100 border-l border-[#0a0a0a]"
                  >
                    <Plus size={9} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="text-sm font-bold text-[#0a0a0a] truncate">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                  {displayOriginal && (
                    <span className="text-[10px] text-gray-400 line-through shrink-0">
                      ₹{displayOriginal.toLocaleString()}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="text-[10px] font-bold text-[#dc2626] shrink-0">
                      Out of stock
                    </span>
                  )}
                </div>
                {product.stock > 0 && (
                  <button
                    onClick={handleAdd}
                    className="w-7 h-7 bg-[#0a0a0a] text-white flex items-center justify-center hover:bg-[#dc2626] transition-colors shrink-0"
                  >
                    <Plus size={13} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    {/* Share Modal */}
    <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              key="share-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              key="share-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 p-6 w-full max-w-md pointer-events-auto shadow-2xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 size={20} className="text-green-600" />
                </div>
                <h3 className="font-black text-lg text-center mb-1 text-[#0a0a0a]">Share Product</h3>
                <p className="text-sm text-gray-500 text-center mb-6">Copy the link below to share this product</p>
                
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/products/${product._id}` : ''}
                    className="flex-1 border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/products/${product._id}`);
                        setCopied(true);
                        showToast('Link copied to clipboard');
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-xs font-bold hover:bg-[#dc2626] transition-colors whitespace-nowrap">
                    {copied ? (
                      <>
                        <Check size={14} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-2.5 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
