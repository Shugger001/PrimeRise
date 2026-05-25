import {
  getBundlePromoBannerLine,
  getBundleSavingsDisplay,
  getBundleSecondarySavingsDisplay,
} from "@/lib/bundle-promo";
import {
  getBundleStripePaymentLink,
  getFourBottleBundleStripePaymentLink,
  getTwelveBottleBundleStripePaymentLink,
} from "@/lib/stripe-payment-links";
import { createClient, isSupabaseServerEnvConfigured } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/types/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const view = new URL(request.url).searchParams.get("view");
  const forCollection = view === "collection";
  const pearVitalStripe = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PEAR_VITAL?.trim() || undefined;
  const catalogStripe = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() || undefined;
  const bundle4Stripe = getFourBottleBundleStripePaymentLink() || undefined;
  const bundle12Stripe = getTwelveBottleBundleStripePaymentLink() || undefined;
  const bundleStripe = getBundleStripePaymentLink() || undefined;
  const linkPayload = {
    bundleSavingsDisplay: getBundleSavingsDisplay(),
    bundleSecondarySavingsDisplay: getBundleSecondarySavingsDisplay(),
    bundlePromoBannerLine: getBundlePromoBannerLine(),
    ...(pearVitalStripe ? { stripePaymentLinkPearVital: pearVitalStripe } : {}),
    ...(catalogStripe ? { stripePaymentLinkCatalog: catalogStripe } : {}),
    ...(bundle4Stripe ? { stripePaymentLinkBundle4: bundle4Stripe } : {}),
    ...(bundle12Stripe ? { stripePaymentLinkBundle12: bundle12Stripe } : {}),
    ...(bundleStripe ? { stripePaymentLinkBundle: bundleStripe } : {}),
  };

  if (!isSupabaseServerEnvConfigured()) {
    return NextResponse.json({ products: [], ...linkPayload });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Could not load products", products: [], ...linkPayload }, { status: 500 });
    }

    const rows = (data ?? []) as ProductRow[];

    return NextResponse.json({
      products: rows.map((row) => {
        if (!forCollection) {
          return {
            id: row.id,
            name: row.name,
            image_url: row.image_url,
          };
        }
        return {
          id: row.id,
          name: row.name,
          image_url: row.image_url,
          description: row.description,
          highlights: row.highlights,
          ingredients: row.ingredients,
          serving_size: row.serving_size,
          price: row.price,
          stock: row.stock,
        };
      }),
      ...linkPayload,
    });
  } catch {
    return NextResponse.json({ error: "Could not load products", products: [], ...linkPayload }, { status: 500 });
  }
}
