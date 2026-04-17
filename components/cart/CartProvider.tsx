"use client";

import type { CartLine } from "@/lib/types/cart";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "primerise_cart_v1";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CartLine =>
        x &&
        typeof x === "object" &&
        typeof (x as CartLine).productId === "string" &&
        typeof (x as CartLine).name === "string" &&
        typeof (x as CartLine).price === "number" &&
        typeof (x as CartLine).quantity === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(loadFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const addItem = useCallback((item: Omit<CartLine, "quantity"> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === item.productId);
      if (i === -1) {
        return [...prev, { ...item, quantity: qty }];
      }
      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + qty };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.productId !== productId));
      return;
    }
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((a, l) => a + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((a, l) => a + l.price * l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [lines, itemCount, subtotal, addItem, setQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
