/**
 * Bundle urgency-strip countdown length. Static homepage timers must match — see `initBundleLandingHomeCountdown` in `public/main.js`.
 */
export const BUNDLE_COUNTDOWN_DAYS = 30;

/**
 * Single source for bundle promo savings copy (banner + badges).
 * Override with NEXT_PUBLIC_BUNDLE_SAVINGS_DISPLAY in Vercel / .env.local.
 */
export function getBundleSavingsDisplay(): string {
  return process.env.NEXT_PUBLIC_BUNDLE_SAVINGS_DISPLAY?.trim() || "save $45.95";
}

/** Second savings line in the bundle urgency strip (e.g. shipping or add-on). */
export function getBundleSecondarySavingsDisplay(): string {
  return process.env.NEXT_PUBLIC_BUNDLE_SECONDARY_SAVINGS_DISPLAY?.trim() || "save $4.95";
}

export function getBundlePromoBannerLine(): string {
  return `Special offer · ${getBundleSavingsDisplay()} · Six-bottle bundle`;
}
