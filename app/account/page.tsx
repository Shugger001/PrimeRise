import { SignOutButton } from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import { getOrdersForCurrentUser } from "@/lib/services/account-orders";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatMoney(cents: number | null, currency: string) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(cents / 100);
}

function avatarInitial(email: string | undefined) {
  const first = (email ?? "").trim().charAt(0);
  return first ? first.toUpperCase() : "U";
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: orders } = await getOrdersForCurrentUser(user.id);

  return (
    <main id="main-content" className="page-main mx-auto max-w-3xl px-4 py-12" tabIndex={-1}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-forest)] text-sm font-bold text-white"
            aria-hidden="true"
          >
            {avatarInitial(user.email)}
          </div>
          <div>
          <h1 className="font-serif text-3xl text-[var(--color-bg-deep)]">Your account</h1>
          <p className="mt-1 text-sm text-neutral-600">{user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-10" aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="text-lg font-semibold text-[var(--color-bg-deep)]">
          Orders
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Purchases made while signed in are listed here. Guest checkout orders only appear in your email receipt.
        </p>

        {!orders || orders.length === 0 ? (
          <p className="mt-6 rounded-lg border border-neutral-200 bg-white px-4 py-6 text-neutral-600">
            No orders yet.{" "}
            <Link href="/products" className="font-medium text-[var(--color-bg-deep)] underline">
              Browse products
            </Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-6">
            {orders.map((order) => (
              <li key={order.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-[var(--color-bg-deep)]">
                    {new Date(order.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="tabular-nums text-neutral-800">{formatMoney(order.amount_total_cents, order.currency)}</p>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{order.status}</p>
                <ul className="mt-3 space-y-1 text-sm text-neutral-700">
                  {order.order_items?.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="tabular-nums text-neutral-600">
                        {formatMoney(item.unit_price_cents * item.quantity, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
