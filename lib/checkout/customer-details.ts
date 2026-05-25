import type Stripe from "stripe";

const DEFAULT_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
  ["US"];

/** ISO country codes for Stripe Checkout shipping (comma-separated in env). */
export function shippingCountriesFromEnv(): Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] {
  const raw = process.env.CHECKOUT_SHIPPING_COUNTRIES?.trim();
  if (!raw) return DEFAULT_SHIPPING_COUNTRIES;

  const codes = raw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c));

  return codes.length > 0 ?
      (codes as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[])
    : DEFAULT_SHIPPING_COUNTRIES;
}

export type ParsedCheckoutCustomer = {
  email: string | null;
  name: string | null;
  phone: string | null;
  shippingAddress: string | null;
};

function formatAddress(addr: Stripe.Address | null | undefined): string | null {
  if (!addr) return null;
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : null;
}

/** Normalize contact + shipping fields from a completed Checkout Session. */
export function parseCheckoutCustomer(session: Stripe.Checkout.Session): ParsedCheckoutCustomer {
  const details = session.customer_details;
  const email = details?.email ?? session.customer_email ?? null;
  const name =
    details?.name ??
    (details as { individual_name?: string | null } | null | undefined)?.individual_name ??
    null;
  const phone = details?.phone ?? null;
  const shippingAddress = formatAddress(details?.address ?? null);

  return {
    email: email?.trim() || null,
    name: name?.trim() || null,
    phone: phone?.trim() || null,
    shippingAddress,
  };
}
