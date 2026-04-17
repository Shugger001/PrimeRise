import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-serif text-3xl text-[var(--color-bg-deep)]">Checkout canceled</h1>
      <p className="mt-4 text-neutral-700">No charge was made. Your cart is still saved on this device.</p>
      <div className="mx-auto mt-5 max-w-md rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-card)] px-4 py-3 text-left text-sm text-neutral-700">
        <p className="font-medium text-[var(--color-bg-deep)]">Before you go</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your selected blends are still in your cart.</li>
          <li>You can return anytime to complete checkout.</li>
          <li>No payment was captured.</li>
        </ul>
      </div>
      <p className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/cart" className="btn btn--primary inline-flex">
          Return to cart
        </Link>
        <Link href="/products" className="btn btn--ghost inline-flex border border-neutral-400">
          Browse products
        </Link>
      </p>
    </div>
  );
}
