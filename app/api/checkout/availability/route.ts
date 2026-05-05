import { NextResponse } from "next/server";

export const runtime = "nodejs";

function stripeSecretConfigured() {
  const k = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(k && /^(sk|rk)_(test|live)_/.test(k));
}

/** True when cart can use Checkout Sessions (dynamic line items + quantities). */
export async function GET() {
  return NextResponse.json({ sessionCheckout: stripeSecretConfigured() });
}
