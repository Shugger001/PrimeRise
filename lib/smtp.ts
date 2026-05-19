import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export function smtpEnvMissingPieces(): string[] {
  const missing: string[] = [];
  if (!process.env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  return missing;
}

export function createSmtpTransporter(): Transporter | null {
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

export function mailFromAddress() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const custom = process.env.WAITLIST_NOTIFY_FROM?.trim() || process.env.ORDER_CONFIRM_FROM?.trim();
  if (custom) return custom;
  return smtpUser || "no-reply@primerisedrinks.com";
}
