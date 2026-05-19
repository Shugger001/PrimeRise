export type StripePaymentLinkItem = { href: string; label: string };

const CATALOG_CTA_LABEL = "Buy on Stripe";
const DEFAULT_SIX_BOTTLE_BUNDLE_LINK = "https://buy.stripe.com/aFaaEXa9y3Mzgs1e0D93y0f";
const DEFAULT_FOUR_BOTTLE_BUNDLE_LINK = "https://buy.stripe.com/9B6fZh3La3Mz0t33lZ93y0b";
const DEFAULT_TWELVE_BOTTLE_BUNDLE_LINK = "https://buy.stripe.com/00w6oHbdC5UH6RrcWz93y0g";

/**
 * Stripe Payment Link for the full Prime Rise line **except Pear Vital**
 * (Pear Vital uses {@link getPearVitalStripePaymentLink}).
 */
export function getCatalogStripePaymentLink(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() ?? "";
}

export function getCatalogStripePaymentLinkItem(): StripePaymentLinkItem | null {
  const href = getCatalogStripePaymentLink();
  if (!href) return null;
  return { href, label: CATALOG_CTA_LABEL };
}

const BUNDLE_CTA_LABEL = "All 6 blends — bundle";
const BUNDLE_4_CTA_LABEL = "4 blends — bundle";
const BUNDLE_12_CTA_LABEL = "12 bottles — bundle";

/** Payment Link for the complete six-product bundle (Stripe Checkout). */
export function getBundleStripePaymentLink(): string {
  const configured = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE?.trim() ?? "";
  return configured || DEFAULT_SIX_BOTTLE_BUNDLE_LINK;
}

export function getBundleStripePaymentLinkItem(): StripePaymentLinkItem | null {
  const href = getBundleStripePaymentLink();
  if (!href) return null;
  return { href, label: BUNDLE_CTA_LABEL };
}

/** Payment Link for the 4-product bundle (Stripe Checkout). */
export function getFourBottleBundleStripePaymentLink(): string {
  const configured = (
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_4?.trim() ??
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_FOUR?.trim() ??
    ""
  );
  return configured || DEFAULT_FOUR_BOTTLE_BUNDLE_LINK;
}

export function getFourBottleBundleStripePaymentLinkItem(): StripePaymentLinkItem | null {
  const href = getFourBottleBundleStripePaymentLink();
  if (!href) return null;
  return { href, label: BUNDLE_4_CTA_LABEL };
}

/** Payment Link for the 12-bottle bundle (Stripe Checkout). */
export function getTwelveBottleBundleStripePaymentLink(): string {
  const configured = (
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_12?.trim() ??
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUNDLE_TWELVE?.trim() ??
    ""
  );
  return configured || DEFAULT_TWELVE_BOTTLE_BUNDLE_LINK;
}

export function getTwelveBottleBundleStripePaymentLinkItem(): StripePaymentLinkItem | null {
  const href = getTwelveBottleBundleStripePaymentLink();
  if (!href) return null;
  return { href, label: BUNDLE_12_CTA_LABEL };
}

/** Hero / cart: catalog (singles except Pear Vital), then optional bundles. */
export function getStripePaymentLinks(): StripePaymentLinkItem[] {
  const out: StripePaymentLinkItem[] = [];
  const catalog = getCatalogStripePaymentLinkItem();
  if (catalog) out.push(catalog);
  const bundle4 = getFourBottleBundleStripePaymentLinkItem();
  if (bundle4) out.push(bundle4);
  const bundle = getBundleStripePaymentLinkItem();
  if (bundle) out.push(bundle);
  const bundle12 = getTwelveBottleBundleStripePaymentLinkItem();
  if (bundle12) out.push(bundle12);
  return out;
}

/** Stripe Payment Link dedicated to Pear Vital (product card + collection). */
export function getPearVitalStripePaymentLink(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PEAR_VITAL?.trim() ?? "";
}
