import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(30),
});

function encodeItems(items: { productId: string; quantity: number }[]) {
  return items.map((i) => `${i.productId}:${i.quantity}`).join(",");
}

function toStripeImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return undefined;
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
    return imageUrl;
  } catch {
    return undefined;
  }
}

function siteUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (request.headers.get("x-forwarded-proto") && request.headers.get("host")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const validated: { productId: string; quantity: number; name: string; unitAmountCents: number }[] = [];

  for (const line of parsed.data.items) {
    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, price, stock, image_url")
      .eq("id", line.productId)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json({ error: `Product not found: ${line.productId}` }, { status: 400 });
    }

    const price = product.price != null ? Number(product.price) : NaN;
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: `Product is not available for purchase: ${product.name}` }, { status: 400 });
    }

    const stock = product.stock ?? 0;
    if (stock < line.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for ${product.name}. Available: ${stock}` },
        { status: 400 }
      );
    }

    const unitAmountCents = Math.round(price * 100);
    validated.push({
      productId: product.id,
      quantity: line.quantity,
      name: product.name,
      unitAmountCents,
    });

    const stripeImageUrl = toStripeImageUrl(product.image_url);
    lineItems.push({
      price_data: {
        currency: "usd",
        unit_amount: unitAmountCents,
        product_data: {
          name: product.name,
          images: stripeImageUrl ? [stripeImageUrl] : undefined,
          metadata: { product_id: product.id },
        },
      },
      quantity: line.quantity,
    });
  }

  const origin = siteUrl(request);

  const {
    data: { user: checkoutUser },
  } = await supabase.auth.getUser();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        prime_items: encodeItems(
          validated.map((v) => ({ productId: v.productId, quantity: v.quantity }))
        ),
        ...(checkoutUser?.id ? { supabase_user_id: checkoutUser.id } : {}),
      },
      phone_number_collection: { enabled: false },
      billing_address_collection: "required",
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout URL was not generated. Please try again." }, { status: 503 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Unknown error";
    console.error("Stripe session error:", detail);

    if (detail.includes("Missing STRIPE_SECRET_KEY")) {
      return NextResponse.json(
        { error: "Checkout is temporarily unavailable. Stripe is not configured yet." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Checkout could not be started. Please try again in a few minutes." },
      { status: 503 }
    );
  }
}
