"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { ProductRow } from "@/lib/types/database";

/** Compact add-to-cart on the card face; clicks must not toggle the <details> summary. */
export function ProductCardCartActions({ product }: { product: ProductRow }) {
  return (
    <div
      className="product-card-mini__actions"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <AddToCartButton product={product} layout="compact" />
    </div>
  );
}
