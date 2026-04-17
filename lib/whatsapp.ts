/** Build https://wa.me/... from env or config; digits only, international format (no +). */
export function whatsAppHrefFromRaw(raw: string | undefined | null): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}`;
}
