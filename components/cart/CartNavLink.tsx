"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartNavLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="nav__link relative">
      Cart
      {itemCount > 0 && (
        <span
          className="absolute -right-2 -top-1 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-[var(--color-gold)] px-0.5 text-[0.65rem] font-bold text-[var(--color-bg-deep)]"
          aria-label={`${itemCount} items in cart`}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
