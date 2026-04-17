import { getOrdersForAdmin } from "@/lib/services/orders";

function centsToUsd(cents: number | null) {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminOrdersPage() {
  const { data: orders, error } = await getOrdersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)]">Orders</h1>
        <p className="mt-1 text-sm text-admin-muted">Stripe Checkout orders (most recent first)</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[760px] text-left text-[0.95rem] md:text-sm">
          <thead className="border-b border-admin-border bg-admin-head text-[0.72rem] uppercase text-admin-muted md:text-xs">
            <tr>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Total</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {!orders?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-admin-muted">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders?.map((o) => (
              <tr key={o.id}>
                <td className="whitespace-nowrap px-4 py-4 text-neutral-700">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="max-w-[200px] truncate px-4 py-4 text-neutral-700">
                  {o.customer_email ?? "—"}
                </td>
                <td className="px-4 py-4 tabular-nums text-admin-ink">{centsToUsd(o.amount_total_cents)}</td>
                <td className="px-4 py-4 font-medium text-admin-accentDeep">{o.status}</td>
                <td className="px-4 py-4 text-admin-muted">
                  <ul className="list-inside list-disc space-y-1 text-xs leading-5">
                    {(o.order_items ?? []).map((it) => (
                      <li key={it.id}>
                        {it.product_name} × {it.quantity} @ {centsToUsd(it.unit_price_cents * it.quantity)}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
