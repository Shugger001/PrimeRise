"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { CartLine } from "@/lib/types/cart";
import { useEffect } from "react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { lines, itemCount, subtotal, setQuantity, removeItem, clear } = useCart();
  const checkoutEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";
  const contactEmail = "info@primerisedrinks.com";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Record<string, boolean>>({});
  const [lastRemoved, setLastRemoved] = useState<CartLine | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);

  async function checkout() {
    if (lines.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function onClearCart() {
    if (lines.length === 0) return;
    const ok = window.confirm("Clear all items from your cart?");
    if (ok) clear();
  }

  function onRemoveLine(line: CartLine) {
    removeItem(line.productId);
    setLastRemoved(line);
    setUndoOpen(true);
  }

  function onUndoRemove() {
    if (!lastRemoved) return;
    const restoreQty = Math.max(1, Math.min(99, lastRemoved.quantity));
    setQuantity(lastRemoved.productId, restoreQty);
    setUndoOpen(false);
  }

  function updateQuantityWithFeedback(productId: string, quantity: number) {
    setQuantity(productId, quantity);
    setRecentlyUpdated((prev) => ({ ...prev, [productId]: true }));
  }

  useEffect(() => {
    if (Object.keys(recentlyUpdated).length === 0) return;
    const t = window.setTimeout(() => setRecentlyUpdated({}), 650);
    return () => window.clearTimeout(t);
  }, [recentlyUpdated]);

  useEffect(() => {
    if (!undoOpen) return;
    const t = window.setTimeout(() => setUndoOpen(false), 4500);
    return () => window.clearTimeout(t);
  }, [undoOpen]);

  return (
    <div id="top" className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-card)] p-6 pb-24 shadow-[0_16px_40px_rgba(45,51,34,0.08)] md:p-8 md:pb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-[var(--color-bg-deep)]">Your cart</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {itemCount === 0 ? "No items yet" : `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`}
            </p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-[var(--color-forest)] underline underline-offset-4">
            Continue shopping
          </Link>
        </div>

        {lines.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[var(--color-line)] bg-white/70 px-5 py-8 text-center">
            <p className="text-neutral-700">Your cart is empty.</p>
            <p className="mt-2 text-sm text-neutral-600">
              Add your blends to continue to secure checkout.
            </p>
            <Link href="/products" className="btn btn--primary mt-5 inline-flex">
              Shop products
            </Link>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
            {lines.map((line) => (
              <li
                key={line.productId}
                className={`flex flex-wrap items-center gap-4 px-4 py-4 transition-colors md:px-5 ${
                  recentlyUpdated[line.productId] ? "bg-[rgba(79,92,56,0.08)]" : ""
                }`}
              >
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.name}
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 rounded-lg border border-neutral-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-xs text-neutral-500">
                    Item
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-bg-deep)]">{line.name}</p>
                  <p className="text-sm text-neutral-600">${line.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease quantity for ${line.name}`}
                    onClick={() => updateQuantityWithFeedback(line.productId, Math.max(1, line.quantity - 1))}
                    disabled={loading}
                    className="h-8 w-8 rounded border border-neutral-300 text-base leading-none text-neutral-700 hover:bg-neutral-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    aria-label={`Quantity for ${line.name}`}
                    value={line.quantity}
                    onChange={(e) =>
                      updateQuantityWithFeedback(line.productId, Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    disabled={loading}
                    inputMode="numeric"
                    className="w-14 rounded border border-neutral-300 px-2 py-1 text-center text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Increase quantity for ${line.name}`}
                    onClick={() => updateQuantityWithFeedback(line.productId, Math.min(99, line.quantity + 1))}
                    disabled={loading}
                    className="h-8 w-8 rounded border border-neutral-300 text-base leading-none text-neutral-700 hover:bg-neutral-50"
                  >
                    +
                  </button>
                </div>
                <p className="w-24 text-right font-medium text-[var(--color-bg-deep)]">
                  ${(line.price * line.quantity).toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveLine(line)}
                  disabled={loading}
                  className="text-sm text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <div className="mt-8 flex flex-col gap-4 border-t border-neutral-200 pt-6">
            <div className="grid gap-2 sm:grid-cols-3">
              <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-bg-deep)]">
                Secure Stripe payment
              </p>
              <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-bg-deep)]">
                Transparent pricing
              </p>
              <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-bg-deep)]">
                Crafted fresh in small batches
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <h2 className="font-serif text-xl text-[var(--color-bg-deep)]">Order summary</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center justify-between text-neutral-700">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </p>
                <p className="flex items-center justify-between text-[var(--color-bg-deep)]">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-base font-semibold">${subtotal.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">
              {checkoutEnabled
                ? "Taxes and shipping (if any) are shown before you place your order. Payments are encrypted and processed by Stripe."
                : "Online checkout is coming soon. Contact us to place your order directly."}
            </p>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn--primary"
                disabled={loading || !checkoutEnabled}
                onClick={() => void checkout()}
                aria-busy={loading}
                aria-disabled={loading || !checkoutEnabled}
              >
                {checkoutEnabled ? (loading ? "Redirecting…" : "Checkout") : "Checkout coming soon"}
              </button>
              {!checkoutEnabled && (
                <a
                  href={`mailto:${contactEmail}?subject=Prime%20Rise%20Order%20Request`}
                  className="btn btn--ghost border border-neutral-400"
                >
                  Contact to order
                </a>
              )}
              <button
                type="button"
                className="btn btn--ghost border border-neutral-400"
                onClick={onClearCart}
                disabled={loading}
                aria-disabled={loading}
              >
                Clear cart
              </button>
            </div>
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 text-sm text-neutral-700">
              <p className="font-medium text-[var(--color-bg-deep)]">Checkout confidence</p>
              <p className="mt-1">
                {checkoutEnabled
                  ? "Every order shows a clear total before payment. No hidden fees, no surprise charges."
                  : `For now, place orders by email at ${contactEmail}.`}
              </p>
            </div>
            <div className="md:hidden">
              <a href="#top" className="text-sm font-semibold text-[var(--color-forest)] underline underline-offset-4">
                Back to top
              </a>
            </div>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-bg-card)]/95 p-4 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Subtotal</p>
              <p className="text-base font-semibold text-[var(--color-bg-deep)]">${subtotal.toFixed(2)}</p>
            </div>
            {checkoutEnabled ? (
              <button
                type="button"
                className="btn btn--primary"
                disabled={loading}
                onClick={() => void checkout()}
                aria-busy={loading}
              >
                {loading ? "Redirecting…" : "Checkout"}
              </button>
            ) : (
              <a
                href={`mailto:${contactEmail}?subject=Prime%20Rise%20Order%20Request`}
                className="btn btn--primary"
              >
                Contact to order
              </a>
            )}
          </div>
        </div>
      )}

      {undoOpen && lastRemoved && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-700">
              Removed <span className="font-medium text-[var(--color-bg-deep)]">{lastRemoved.name}</span>
            </p>
            <button
              type="button"
              onClick={onUndoRemove}
              className="text-sm font-semibold text-[var(--color-forest)] underline underline-offset-4"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
