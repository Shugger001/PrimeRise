import { ClearCartOnSuccess } from "@/components/cart/ClearCartOnSuccess";
import { getCheckoutSuccessSummary } from "@/lib/checkout/success-summary";
import Link from "next/link";

export const dynamic = "force-dynamic";

function sessionIdFromSearch(
  raw: string | string[] | undefined
): string | undefined {
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return undefined;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const sp = await searchParams;
  const sessionId = sessionIdFromSearch(sp.session_id);
  const summary = sessionId
    ? await getCheckoutSuccessSummary(sessionId)
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <ClearCartOnSuccess />
      <h1 className="font-serif text-3xl text-[var(--color-bg-deep)]">Thank you</h1>

      {summary ? (
        <>
          <p className="mt-4 text-neutral-700">
            Your payment was received
            {summary.paymentStatus === "paid" ? "" : ` (${summary.paymentStatus})`}.
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Your blends are now in production flow. We will share fulfillment updates by email.
          </p>
          <p className="mt-3 text-lg font-semibold text-[var(--color-bg-deep)]">
            Total paid: {summary.formattedTotal}
          </p>
          {summary.email && (
            <p className="mt-2 text-sm text-neutral-600">
              Confirmation details are sent to <span className="font-medium">{summary.email}</span>.
            </p>
          )}
          {summary.lines.length > 0 && (
            <ul className="mt-6 text-left text-sm text-neutral-700">
              {summary.lines.map((line, i) => (
                <li
                  key={`${line.description}-${i}`}
                  className="flex justify-between gap-4 border-b border-neutral-100 py-2 last:border-0"
                >
                  <span>
                    {line.description}
                    {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                  </span>
                  <span className="shrink-0 tabular-nums">{line.lineTotalFormatted}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="mt-4 text-neutral-700">
          Your order is being confirmed. You will get a confirmation email from Stripe when processing
          completes.
        </p>
      )}

      <div className="mx-auto mt-6 max-w-md rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-card)] px-4 py-3 text-left text-sm text-neutral-700">
        <p className="font-medium text-[var(--color-bg-deep)]">What happens next</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Order confirmation is delivered to your email.</li>
          <li>You receive an update once the order is packed.</li>
          <li>Delivery timing appears in your shipment update.</li>
        </ul>
      </div>

      <p className="mt-6">
        <Link href="/products" className="btn btn--primary inline-flex">
          Back to products
        </Link>
      </p>
    </div>
  );
}
