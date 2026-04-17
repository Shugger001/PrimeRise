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
  const sessionId = session.id;

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return;
  }

  const raw = session.metadata?.prime_items;
  if (!raw || typeof raw !== "string") {
    console.error("stripe webhook: missing prime_items metadata", sessionId);
    return;
  }

  let pairs: { productId: string; quantity: number }[];
  try {
    pairs = decodePrimeItems(raw);
  } catch {
    console.error("stripe webhook: bad prime_items", raw);
    return;
  }

  type Row = {
    product: { id: string; name: string; price: unknown; stock: number | null };
    quantity: number;
    unitCents: number;
  };

  const rows: Row[] = [];
  let sumCents = 0;

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
    rows.push({ product, quantity: pair.quantity, unitCents });
  }

  const total = session.amount_total;
  if (total != null && sumCents !== total) {
    console.error("stripe webhook: amount mismatch", { sumCents, total, sessionId });
    return;
  }

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
      product_id: row.product.id,
      product_name: row.product.name,
      quantity: row.quantity,
      unit_price_cents: row.unitCents,
    });

    if (itemErr) {
      console.error("stripe webhook: order_item insert", itemErr);
      throw itemErr;
    }

    const currentStock = row.product.stock ?? 0;
    const nextStock = Math.max(0, currentStock - row.quantity);
    const { error: stockErr } = await supabase.from("products").update({ stock: nextStock }).eq("id", row.product.id);

    if (stockErr) {
      console.error("stripe webhook: stock update", stockErr);
      throw stockErr;
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
