import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

function isValidEmail(value: unknown) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "https://primerisedrinks.com";
}

function mailFromAddress() {
  return (
    process.env.ACCOUNT_WELCOME_FROM?.trim() ||
    process.env.WAITLIST_NOTIFY_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "no-reply@primerisedrinks.com"
  );
}

function createSmtpTransporter() {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure && smtpPort === 587,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

async function notifyNewAccount(email: string) {
  const transporter = createSmtpTransporter();
  if (!transporter) return;

  const from = `"Prime Rise Drinks" <${mailFromAddress()}>`;
  const heroImageUrl = `${getSiteUrl()}/images/lifestyle-wellness-elevated.png?v=4`;

  const textBody = [
    "Hi,",
    "",
    "Welcome to Prime Rise.",
    "",
    "This isn’t just another beverage.",
    "",
    "It’s a return to something real — crafted with intention, rooted in tradition, and elevated for modern living.",
    "",
    "Every blend you’ll experience is built from time-honored ingredients, refined into something clean, powerful, and purposeful.",
    "",
    "No shortcuts.",
    "No artificial noise.",
    "Just natural energy, balance, and clarity — the way it should be.",
    "",
    "You’re here early — and that matters.",
    "",
    "Over the next few days, we’ll introduce you to what we’ve been quietly building.",
    "",
    `Hero image: ${heroImageUrl}`,
    "",
    "Stay close.",
    "",
    "— Prime Rise",
    "Elevate your everyday energy",
    "www.primerisedrinks.com",
  ].join("\n");

  const htmlBody = `
<p>Hi,</p>
<p>Welcome to Prime Rise.</p>
<p>This isn’t just another beverage.</p>
<p>It’s a return to something real — crafted with intention, rooted in tradition, and elevated for modern living.</p>
<p>Every blend you’ll experience is built from time-honored ingredients, refined into something clean, powerful, and purposeful.</p>
<p>No shortcuts.<br />No artificial noise.<br />Just natural energy, balance, and clarity — the way it should be.</p>
<p>You’re here early — and that matters.</p>
<p>Over the next few days, we’ll introduce you to what we’ve been quietly building.</p>
<p><img src="${heroImageUrl}" alt="Prime Rise hero lifestyle" width="600" style="width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" /></p>
<p>Stay close.</p>
<p>— Prime Rise<br />Elevate your everyday energy<br /><a href="https://www.primerisedrinks.com">www.primerisedrinks.com</a></p>
`.trim();

  await transporter.sendMail({
    from,
    to: email,
    replyTo: "no-reply@primerisedrinks.com",
    subject: "You’re now part of Prime Rise",
    text: textBody,
    html: htmlBody,
  });
}

export async function POST(request: Request) {
  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  try {
    await notifyNewAccount(email);
  } catch (error) {
    console.error("account welcome email:", error);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
