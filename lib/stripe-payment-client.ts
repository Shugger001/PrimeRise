import type { StripePaymentLinkItem } from "@/lib/stripe-payment-links";

/**
 * Client-only reads of `NEXT_PUBLIC_*` payment links so Vercel/Next inlines URLs
 * reliably in the browser bundle (avoids empty `href` on `/cart`).
 */
export function getStripePaymentLinksForClient(): StripePaymentLinkItem[] {
  const catalog = (process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "").trim();
  const defaultBundle4 = "https://buy.stripe.com/9B6fZh3La3Mz0t33lZ93y0b";
  const bundle4 = (
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_4 ??
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_FOUR ??
    defaultBundle4
  ).trim();
  const defaultBundle6 = "https://buy.stripe.com/aFaaEXa9y3Mzgs1e0D93y0f";
  const bundle = (process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE ?? defaultBundle6).trim();
  const defaultBundle12 = "https://buy.stripe.com/00w6oHbdC5UH6RrcWz93y0g";
  const bundle12 = (
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_12 ??
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_TWELVE ??
    defaultBundle12
  ).trim();
  const out: StripePaymentLinkItem[] = [];
  if (catalog) out.push({ href: catalog, label: "Buy on Stripe" });
  if (bundle4) out.push({ href: bundle4, label: "4 blends — bundle" });
  if (bundle) out.push({ href: bundle, label: "All 6 blends — bundle" });
  if (bundle12) out.push({ href: bundle12, label: "12 bottles — bundle" });
  return out;
}
