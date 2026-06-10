"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Minus } from "lucide-react";

export default function ProductCard({ product, index }) {
  const { addToCart, updateQty, removeFromCart, cartItems } = useCart();
  const { showToast } = useToast();

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
        {/* Top-right index */}
        {index != null && (
          <span className="absolute top-2 right-2 text-[10px] text-gray-400 font-mono">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
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
  );
}
