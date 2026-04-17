import { getStripe } from "@/lib/stripe";

export type CheckoutSuccessLine = {
  description: string;
  quantity: number;
  lineTotalFormatted: string;
};

export type CheckoutSuccessSummary = {
  formattedTotal: string;
  email: string | null;
  paymentStatus: string;
  lines: CheckoutSuccessLine[];
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export async function getCheckoutSuccessSummary(
  sessionId: string
): Promise<CheckoutSuccessSummary | null> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const currency = (session.currency ?? "usd").toLowerCase();
    const totalCents = session.amount_total ?? 0;
    const formattedTotal = formatMoney(totalCents, currency);

    const email =
      session.customer_details?.email ?? session.customer_email ?? null;

    const lines: CheckoutSuccessLine[] = [];
    const li = session.line_items?.data;
    if (li) {
      for (const item of li) {
        const desc = item.description?.trim() || "Item";
        const qty = item.quantity ?? 1;
        const cents = item.amount_total ?? 0;
        lines.push({
          description: desc,
          quantity: qty,
          lineTotalFormatted: formatMoney(cents, currency),
        });
      }
    }

    return {
      formattedTotal,
      email,
      paymentStatus: session.payment_status ?? "unknown",
      lines,
    };
  } catch {
    return null;
  }
}
