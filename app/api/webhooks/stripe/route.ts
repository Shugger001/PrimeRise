import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function decodePrimeItems(raw: string): { productId: string; quantity: number }[] {
  return raw.split(",").map((part) => {
    const idx = part.lastIndexOf(":");
    const id = part.slice(0, idx);
    const q = parseInt(part.slice(idx + 1), 10);
    return { productId: id, quantity: q };
  });
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  const stripe = getStripe();
  const sessionId = session.id;

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return;
  }

  type Row = {
    productId: string | null;
    productName: string;
    quantity: number;
    unitCents: number;
    stockAfterPurchase: { productId: string; nextStock: number } | null;
  };

  const rows: Row[] = [];
  let sumCents = 0;
  const raw = session.metadata?.prime_items;
  if (raw && typeof raw === "string") {
    let pairs: { productId: string; quantity: number }[];
    try {
      pairs = decodePrimeItems(raw);
    } catch {
      console.error("stripe webhook: bad prime_items", raw);
      return;
    }

    for (const pair of pairs) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, price, stock")
        .eq("id", pair.productId)
        .maybeSingle();

      if (error || !product) {
        console.error("stripe webhook: product not found", pair.productId);
        return;
      }

      const priceNum = product.price != null ? Number(product.price) : NaN;
      if (!Number.isFinite(priceNum)) {
        console.error("stripe webhook: bad price", pair.productId);
        return;
      }

      const unitCents = Math.round(priceNum * 100);
      sumCents += unitCents * pair.quantity;
      const currentStock = product.stock ?? 0;
      const nextStock = Math.max(0, currentStock - pair.quantity);
      rows.push({
        productId: product.id,
        productName: product.name,
        quantity: pair.quantity,
        unitCents,
        stockAfterPurchase: { productId: product.id, nextStock },
      });
    }

    const total = session.amount_total;
    if (total != null && sumCents !== total) {
      console.error("stripe webhook: amount mismatch", { sumCents, total, sessionId });
      return;
    }
  } else {
    // Payment Links won't include our custom metadata. Use Stripe line items so admin orders still populate.
    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
    for (const item of lineItems) {
      const quantity = item.quantity ?? 0;
      if (quantity <= 0) continue;
      const lineAmount = item.amount_total ?? item.amount_subtotal ?? 0;
      const unitCents = Math.round(lineAmount / quantity);
      const productName = item.description?.trim() || "Stripe item";
      sumCents += unitCents * quantity;
      rows.push({
        productId: null,
        productName,
        quantity,
        unitCents,
        stockAfterPurchase: null,
      });
    }
  }
  const total = session.amount_total;

  const pi = session.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? null;

  let linkedUserId: string | null = null;
  const metaUid = session.metadata?.supabase_user_id;
  if (typeof metaUid === "string" && UUID_RE.test(metaUid)) {
    const { data: authData, error: authErr } = await supabase.auth.admin.getUserById(metaUid);
    if (!authErr && authData.user) {
      linkedUserId = metaUid;
    }
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      user_id: linkedUserId,
      status: "paid",
      amount_total_cents: total ?? sumCents,
      currency: session.currency ?? "usd",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("stripe webhook: order insert", orderErr);
    throw orderErr ?? new Error("order insert failed");
  }

  for (const row of rows) {
    const { error: itemErr } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: row.productId,
      product_name: row.productName,
      quantity: row.quantity,
      unit_price_cents: row.unitCents,
    });

    if (itemErr) {
      console.error("stripe webhook: order_item insert", itemErr);
      throw itemErr;
    }

    if (row.stockAfterPurchase) {
      const { error: stockErr } = await supabase
        .from("products")
        .update({ stock: row.stockAfterPurchase.nextStock })
        .eq("id", row.stockAfterPurchase.productId);

      if (stockErr) {
        console.error("stripe webhook: stock update", stockErr);
        throw stockErr;
      }
    }
  }

  const customerEmail = session.customer_details?.email ?? session.customer_email;
  if (typeof customerEmail === "string" && customerEmail.trim()) {
    try {
      await sendOrderConfirmationEmail({
        email: customerEmail,
        lines: rows.map((row) => ({
          productName: row.productName,
          quantity: row.quantity,
          unitCents: row.unitCents,
        })),
        totalCents: total ?? sumCents,
        currency: session.currency ?? "usd",
      });
    } catch (emailErr) {
      console.error("stripe webhook: order confirmation email failed", emailErr);
    }
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillOrder(session);
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
