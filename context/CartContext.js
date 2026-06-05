'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

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
      ? cartItems.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i)
      : [...cartItems, { ...product, qty }];
    saveCart(updated);
  };

  const removeFromCart = (id) => saveCart(cartItems.filter(i => i._id !== id));

  const updateQty = (id, qty) =>
    saveCart(cartItems.map(i => i._id === id ? { ...i, qty } : i));

  const clearCart = () => saveCart([]);

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + (i.offerPrice || i.price) * i.qty, 0);
  const totalSavings = cartItems.reduce((s, i) => s + (i.offerPrice ? (i.price - i.offerPrice) * i.qty : 0), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice, totalSavings }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
