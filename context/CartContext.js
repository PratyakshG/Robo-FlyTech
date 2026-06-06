'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [buyNowItem, setBuyNowItem] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('techstore_cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('techstore_cart', JSON.stringify(items));
  };

  const addToCart = (product, qty = 1) => {
    const exists = cartItems.find(i => i._id === product._id);
    const updated = exists
      ? cartItems.map(i => i._id === product._id ? { ...i, qty: Math.min(product.stock, i.qty + qty) } : i)
      : [...cartItems, { ...product, qty }];
    saveCart(updated);
  };

  const removeFromCart = (id) => saveCart(cartItems.filter(i => i._id !== id));

  const updateQty = (id, qty) =>
    saveCart(cartItems.map(i => i._id === id ? { ...i, qty: Math.min(i.stock, qty) } : i));

  const clearCart = () => saveCart([]);

  // buyNow: sets a single-item session for direct checkout
  const buyNow = (product, qty = 1) => setBuyNowItem({ ...product, qty });
  const clearBuyNow = () => setBuyNowItem(null);

  const activeItems = buyNowItem ? [buyNowItem] : cartItems;

  const totalItems = activeItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = activeItems.reduce((s, i) => s + (i.offerPrice || i.price) * i.qty, 0);
  const mrpTotal   = activeItems.reduce((s, i) => {
    // If offer applied: price is base price (MRP). If deal badge: originalPrice is MRP.
    const mrp = i.offerPrice ? i.price : (i.originalPrice || i.price);
    return s + mrp * i.qty;
  }, 0);
  const totalSavings = mrpTotal - totalPrice;

  return (
    <CartContext.Provider value={{
      cartItems: activeItems,
      rawCartItems: cartItems,
      buyNowItem,
      addToCart, removeFromCart, updateQty, clearCart, buyNow, clearBuyNow,
      totalItems, totalPrice, totalSavings, mrpTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
