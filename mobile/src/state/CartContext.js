import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CART_KEY, getJson, setJson } from "../services/storage";

const CartContext = createContext(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}

const clampQuantity = (item, quantity) => {
  const stock = Number.isFinite(Number(item.stock)) ? Math.max(0, Math.floor(Number(item.stock))) : null;
  if (stock === null) return Math.max(1, Math.floor(quantity));
  if (stock <= 0) return 0;
  return Math.min(stock, Math.max(1, Math.floor(quantity)));
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getJson(CART_KEY, []).then(setCart);
  }, []);

  useEffect(() => {
    setJson(CART_KEY, cart);
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id));
      if (existing) {
        const nextQuantity = clampQuantity({ ...existing, stock: product.stock ?? existing.stock }, existing.quantity + quantity);
        return prev.map((item) => String(item.id) === String(product.id) ? { ...item, ...product, quantity: nextQuantity } : item)
          .filter((item) => item.quantity > 0);
      }
      const nextQuantity = clampQuantity(product, quantity);
      if (nextQuantity <= 0) return prev;
      return [...prev, { ...product, quantity: nextQuantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) => prev.map((item) => String(item.id) === String(id) ? { ...item, quantity: clampQuantity(item, quantity) } : item)
      .filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => String(item.id) !== String(id)));
  const clearCart = () => setCart([]);
  const syncCartStock = (products = []) => {
    const stockById = new Map(products.map((product) => [String(product.id), Number(product.stock || 0)]));
    const stockBySku = new Map(products.map((product) => [String(product.sku || product.model || ""), Number(product.stock || 0)]));
    setCart((prev) => prev.map((item) => {
      const stock = stockById.has(String(item.id)) ? stockById.get(String(item.id)) : stockBySku.get(String(item.sku || item.model || ""));
      if (stock === undefined) return item;
      return { ...item, stock, quantity: clampQuantity({ ...item, stock }, item.quantity) };
    }).filter((item) => item.quantity > 0));
  };

  const totals = useMemo(() => {
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    return { count, subtotal };
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, ...totals, addToCart, updateQuantity, removeFromCart, clearCart, syncCartStock }}>
      {children}
    </CartContext.Provider>
  );
}
