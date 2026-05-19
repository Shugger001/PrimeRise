import { createSmtpTransporter, mailFromAddress } from "@/lib/smtp";
import { SHIPPING_INFO } from "@/lib/shipping-info";
import { getSiteUrl } from "@/lib/site-url";

export type OrderEmailLine = {
  productName: string;
  quantity: number;
  unitCents: number;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(cents: number, currency: string) {
  const amount = (cents / 100).toFixed(2);
  return currency.toLowerCase() === "usd" ? `$${amount}` : `${amount} ${currency.toUpperCase()}`;
}

export async function sendOrderConfirmationEmail(params: {
  email: string;
  lines: OrderEmailLine[];
  totalCents: number;
  currency: string;
}) {
  const transporter = createSmtpTransporter();
  if (!transporter) {
    console.warn("order confirmation: SMTP not configured — skipping email");
    return;
  }

  const siteUrl = getSiteUrl();
  const from = `"Prime Rise" <${mailFromAddress()}>`;
  const replyTo = process.env.WAITLIST_SUBSCRIBER_REPLY_TO?.trim() || SHIPPING_INFO.contactEmail;
  const totalFormatted = formatMoney(params.totalCents, params.currency);

  const lineText = params.lines
    .map((l) => `• ${l.productName}${l.quantity > 1 ? ` × ${l.quantity}` : ""} — ${formatMoney(l.unitCents * l.quantity, params.currency)}`)
    .join("\n");

  const lineHtml = params.lines
    .map(
      (l) =>
        `<li>${escapeHtml(l.productName)}${l.quantity > 1 ? ` × ${l.quantity}` : ""} — <strong>${formatMoney(l.unitCents * l.quantity, params.currency)}</strong></li>`
    )
    .join("");

  const shippingBullets = SHIPPING_INFO.bullets.map((b) => `• ${b}`).join("\n");
  const shippingHtml = SHIPPING_INFO.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

  const subject = "Your Prime Rise order is confirmed";

  const textBody = [
    "Hi there,",
    "",
    "Thank you for your Prime Rise order. Your payment was received.",
    "",
    "Order summary:",
    lineText || "• Your items (see Stripe receipt for details)",
    "",
    `Total: ${totalFormatted}`,
    "",
    SHIPPING_INFO.headline + ":",
    shippingBullets,
    "",
    `Shop again: ${siteUrl}/products`,
    "",
    "— Prime Rise",
    siteUrl,
  ].join("\n");

  const htmlBody = `
<p>Hi there,</p>
<p>Thank you for your <strong>Prime Rise</strong> order. Your payment was received.</p>
<p><strong>Order summary</strong></p>
<ul>${lineHtml || "<li>Your items (see your Stripe receipt for details)</li>"}</ul>
<p><strong>Total:</strong> ${escapeHtml(totalFormatted)}</p>
<p><strong>${escapeHtml(SHIPPING_INFO.headline)}</strong></p>
<ul>${shippingHtml}</ul>
<p><a href="${siteUrl}/products" style="color:#4f5c38;text-decoration:underline;">Shop again</a></p>
<p>— Prime Rise<br /><a href="${siteUrl}">${siteUrl}</a></p>
`.trim();

  await transporter.sendMail({
    from,
    to: params.email.trim(),
    replyTo,
    subject,
    text: textBody,
    html: htmlBody,
  });
}
