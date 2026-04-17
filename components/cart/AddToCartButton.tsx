"use client";

import type { ProductRow } from "@/lib/types/database";
import { useCart } from "@/components/cart/CartProvider";
import { useEffect, useState } from "react";

const MAX_QTY = 99;

export function AddToCartButton({ product }: { product: ProductRow }) {
  const { addItem } = useCart();
  const [msg, setMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const price = product.price != null ? Number(product.price) : NaN;
  const stock = product.stock ?? 0;
  const maxQty = Math.min(stock, MAX_QTY);
  const canBuy = Number.isFinite(price) && price > 0 && stock > 0;

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, maxQty)));
  }, [maxQty, product.id]);

  function onClick() {
    if (!canBuy) return;
    const qty = Math.min(Math.max(1, quantity), maxQty);
    addItem({
      productId: product.id,
      name: product.name,
      price,
      imageUrl: product.image_url,
      quantity: qty,
    });
    setMsg(qty === 1 ? "Added to cart" : `Added ${qty} to cart`);
    window.setTimeout(() => setMsg(null), 2000);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <span className="whitespace-nowrap font-medium text-[var(--color-bg-deep)]">Drinks</span>
        <input
          type="number"
          min={1}
          max={maxQty > 0 ? maxQty : 1}
          value={quantity}
          disabled={!canBuy}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isNaN(n)) return;
            setQuantity(Math.min(Math.max(1, n), Math.max(1, maxQty)));
          }}
          className="w-20 rounded border border-neutral-300 px-2 py-2 text-center tabular-nums disabled:opacity-50"
          aria-label="Number of drinks to add"
        />
      </label>
      <button
        type="button"
        className="btn btn--primary"
        disabled={!canBuy}
        onClick={onClick}
      >
        {canBuy ? "Add to cart" : stock <= 0 ? "Out of stock" : "Unavailable"}
      </button>
      {msg && <span className="text-sm text-emerald-700">{msg}</span>}
    </div>
  );
}
