"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useEffect, useRef } from "react";

export function ClearCartOnSuccess() {
  const { clear } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
  }, [clear]);

  return null;
}
