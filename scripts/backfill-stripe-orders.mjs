import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getArg(name, fallback = "") {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : fallback;
}

function parseIntArg(name, fallback) {
  const value = Number(getArg(name, String(fallback)));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function toIsoDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function centsFromLineItem(item) {
  const quantity = item.quantity ?? 0;
  if (quantity <= 0) return 0;
  const lineAmount = item.amount_total ?? item.amount_subtotal ?? 0;
  return Math.round(lineAmount / quantity);
}

async function orderExists(supabase, sessionId) {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

async function insertBackfilledOrder({ supabase, session, lineItems, dryRun }) {
  const rows = lineItems.data
    .map((item) => ({
      product_id: null,
      product_name: item.description?.trim() || "Stripe item",
      quantity: item.quantity ?? 0,
      unit_price_cents: centsFromLineItem(item),
    }))
    .filter((r) => r.quantity > 0);

  const pi = session.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? null;

  const orderPayload = {
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    user_id: null,
    status: "paid",
    amount_total_cents: session.amount_total ?? rows.reduce((n, r) => n + r.unit_price_cents * r.quantity, 0),
    currency: session.currency ?? "usd",
  };

  if (dryRun) {
    return { inserted: false, lineItemCount: rows.length, orderPayload };
  }

  const { data: order, error: orderErr } = await supabase.from("orders").insert(orderPayload).select("id").single();
  if (orderErr || !order) throw orderErr ?? new Error("Failed to insert order");

  if (rows.length > 0) {
    const items = rows.map((r) => ({ ...r, order_id: order.id }));
    const { error: itemsErr } = await supabase.from("order_items").insert(items);
    if (itemsErr) throw itemsErr;
  }

  return { inserted: true, lineItemCount: rows.length, orderPayload };
}

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");
  if (!supabaseUrl || !serviceKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  const dryRun = process.argv.includes("--dry-run");
  const days = parseIntArg("days", 30);
  const maxSessions = parseIntArg("max", 250);

  const stripe = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const createdGte = Math.floor(toIsoDateDaysAgo(days).getTime() / 1000);
  let processed = 0;
  let inserted = 0;
  let skippedExisting = 0;
  let skippedUnpaid = 0;
  let failed = 0;
  let hasMore = true;
  let startingAfter = null;

  while (hasMore && processed < maxSessions) {
    const pageLimit = Math.min(100, maxSessions - processed);
    const list = await stripe.checkout.sessions.list({
      limit: pageLimit,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      created: { gte: createdGte },
    });

    for (const session of list.data) {
      processed += 1;
      startingAfter = session.id;

      if (!(session.payment_status === "paid" && session.status === "complete")) {
        skippedUnpaid += 1;
        continue;
      }

      try {
        if (await orderExists(supabase, session.id)) {
          skippedExisting += 1;
          continue;
        }

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        const result = await insertBackfilledOrder({ supabase, session, lineItems, dryRun });
        inserted += 1;
        console.log(
          `${dryRun ? "DRY-RUN" : "INSERTED"} ${session.id} | ${result.orderPayload.customer_email ?? "no-email"} | items=${result.lineItemCount}`
        );
      } catch (error) {
        failed += 1;
        console.error(`FAILED ${session.id}:`, error instanceof Error ? error.message : String(error));
      }

      if (processed >= maxSessions) break;
    }

    hasMore = list.has_more && processed < maxSessions;
  }

  console.log("----");
  console.log(`Backfill complete${dryRun ? " (dry run)" : ""}.`);
  console.log(`Processed: ${processed}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (existing): ${skippedExisting}`);
  console.log(`Skipped (not paid/complete): ${skippedUnpaid}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
