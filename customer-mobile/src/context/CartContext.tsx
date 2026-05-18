import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authStorage } from "@/services/authStorage";
import { saveSessionCart } from "@/services/authService";
import type { CartItem, Product } from "@/types/domain";

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await authStorage.getCart<CartItem[]>();
      if (Array.isArray(saved)) {
        setItems(saved);
      }
      try {
        const session = await saveSessionCart(saved || []);
        if (session && Array.isArray(saved)) {
          setItems(saved);
        }
      } catch {
        // Session sync is best effort.
      }
      setHydrated(true);
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    authStorage.saveCart(items);
    const timeout = setTimeout(() => {
      saveSessionCart(items).catch(() => undefined);
    }, 400);
    return () => clearTimeout(timeout);
  }, [hydrated, items]);

  const clampQuantity = (product: Product, quantity: number) => {
    const stock = Number(product.stock || 0);
    if (stock <= 0) return 1;
    return Math.max(1, Math.min(stock, Math.floor(quantity || 1)));
  };

  const addItem = (product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => String(item.id) === String(product.id));
      const nextQuantity = clampQuantity(product, (existing?.quantity || 0) + quantity);
      if (existing) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, ...product, quantity: nextQuantity }
            : item,
        );
      }
      return [...current, { ...product, quantity: clampQuantity(product, quantity) }];
    });
  };

  const removeItem = (id: string | number) => {
    setItems((current) => current.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity: clampQuantity(item, quantity) }
          : item,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: items.reduce((count, item) => count + item.quantity, 0),
      totalAmount: items.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0,
      ),
    }),
    [hydrated, items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
