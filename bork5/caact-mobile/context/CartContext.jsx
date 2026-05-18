import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "customer_cart_v1";

const CartContext = createContext(null);

function getItemId(item) {
  const value = item?._id ?? item?.id;
  return value === undefined || value === null ? "" : String(value);
}

function normalizeCartItem(item) {
  const id = getItemId(item);
  return {
    ...item,
    id,
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Number(item.price) || 0,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        setItems(parsed.map(normalizeCartItem).filter((i) => i.id));
      } catch {
        // ignore
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const persist = async () => {
      try {
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    };

    persist();
  }, [items, hydrated]);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const total = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0,
    );

    const addItem = (product, quantity = 1) => {
      const next = normalizeCartItem({
        ...product,
        quantity,
        id: getItemId(product),
      });

      if (!next.id) return;

      setItems((prev) => {
        const existing = prev.find((p) => p.id === next.id);
        if (!existing) return [...prev, next];
        return prev.map((p) =>
          p.id === next.id
            ? { ...p, quantity: Math.max(1, (Number(p.quantity) || 1) + next.quantity) }
            : p,
        );
      });
    };

    const setQuantity = (id, quantity) => {
      const qty = Number(quantity) || 0;
      setItems((prev) =>
        prev
          .map((item) => (item.id === String(id) ? { ...item, quantity: qty } : item))
          .filter((item) => (Number(item.quantity) || 0) > 0),
      );
    };

    const removeItem = (id) => {
      setItems((prev) => prev.filter((item) => item.id !== String(id)));
    };

    const clear = () => setItems([]);

    return {
      hydrated,
      items,
      count,
      total,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
