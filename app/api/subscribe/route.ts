import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function isValidEmail(s: string) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

type SignupMeta = {
  interest: string;
  details: string;
  imagePath: string;
  imageAlt: string;
  linkUrl?: string;
};

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "https://primerisedrinks.com";
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const siteUrl = getSiteUrl();
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return siteUrl + p;
}

function getHeroImageMeta() {
  return {
    url: toAbsoluteUrl("/images/lifestyle-wellness-elevated.png?v=4"),
    alt: "Friends enjoying Prime Rise botanical beverages at golden hour",
  };
}

function getSignupMeta(formId: string): SignupMeta {
  const normalized = String(formId || "").trim().toLowerCase();
  const siteUrl = getSiteUrl();

  // Keep these strings in sync with the marketing copy in public/index.html.
  switch (normalized) {
    case "formhero":
      return {
        interest: "Prime Rise Experience",
        details:
          "Be the first to experience new botanical blends, wellness insights, and exclusive releases designed to elevate your daily vitality.",
        imagePath: "/images/lifestyle-wellness-elevated.png?v=4",
        imageAlt:
          "Friends enjoying Prime Rise botanical beverages — Carrot Vital, Ginger Citrus, and Moringa Mint at golden hour",
        linkUrl: `${siteUrl}/#join-prime-experience`,
      };
    case "formdiscover":
      return {
        interest: "Golden Restore",
        details:
          "Be the first to experience this blend — get availability and restock alerts straight to your inbox.",
        imagePath: "/images/golden-restore-hero-lifestyle.jpeg",
        imageAlt:
          "Prime Rise Golden Restore — two bottles on a table with pineapple and turmeric",
        linkUrl: `${siteUrl}/#discover-golden-restore`,
      };
    case "formstory":
      return {
        interest: "Prime Rise story updates",
        details: "One email for launch day — and occasional notes while the story unfolds.",
        imagePath: "/images/prime-rise-lineup-five.jpeg?v=2",
        imageAlt:
          "Prime Rise — five botanical blends on a wood counter; Hibiscus Bloom, Ginger Citrus, Carrot Vital, Golden Restore, and Moringa Mint, with a soft cafe setting beyond",
        linkUrl: `${siteUrl}/#story`,
      };
    case "formcollection":
      return {
        interest: "Prime Rise collection",
        details:
          "A premium collection of botanical beverages — crafted from real ingredients to restore balance, support recovery, and elevate your everyday energy.",
        imagePath: "/images/prime-rise-lineup-five.jpeg?v=2",
        imageAlt:
          "Prime Rise — five botanical blends on a wood counter; Hibiscus Bloom, Ginger Citrus, Carrot Vital, Golden Restore, and Moringa Mint, with a soft cafe setting beyond",
        linkUrl: `${siteUrl}/#collection`,
      };
    case "formstandard":
      return {
        interest: "Priority wellness access",
        details: "Elevate your daily routine. Get priority access to updates designed for everyday energy.",
        imagePath: "/images/lifestyle-couple-beach-sunset.jpeg",
        imageAlt:
          "A couple enjoying Prime Rise botanical drinks on a beach at sunset, pink beverage in glass bottles with floral labels.",
        linkUrl: siteUrl,
      };
    case "formjoin":
      return {
        interest: "Prime Rise Experience (ingredients & craft)",
        details:
          "Be among the first to experience Prime Rise — early access to new blends, exclusive releases, and wellness insights crafted to elevate your everyday energy. Availability is limited at launch.",
        imagePath: "/images/crafted-intention-hibiscus.jpeg?v=5",
        imageAlt:
          "Prime Rise Hibiscus Bloom — botanical bottle with ginger, lemon, mint, and pomegranate; Crafted with intention.",
        linkUrl: `${siteUrl}/#join`,
      };
    case "formteaser":
      return {
        interest: "Something elevated is coming",
        details: "Early access for what’s next. We’ll reach out when it’s ready.",
        imagePath: "/images/ginger-citrus-coming-soon.jpeg",
        imageAlt: "Ginger Citrus — coming soon",
        linkUrl: siteUrl,
      };
    default:
      return {
        interest: formId ? `Waitlist (${formId})` : "Prime Rise waitlist",
        details: "Thanks for joining Prime Rise — we’ll reach out soon with updates.",
        imagePath: "/images/lifestyle-wellness-elevated.png?v=4",
        imageAlt: "Prime Rise botanical beverages",
        linkUrl: siteUrl,
      };
  }
}

function smtpEnvMissingPieces(): string[] {
  const missing: string[] = [];
  if (!process.env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!process.env.SMTP_PASS?.trim()) missing.push("SMTP_PASS");
  return missing;
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

/** Use the authenticated mailbox (or a verified alias) — many providers reject a different From address. */
function mailFromAddress() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const custom = process.env.WAITLIST_NOTIFY_FROM?.trim();
  if (custom) {
    return custom;
  }
  return smtpUser || "no-reply@primerisedrinks.com";
}

function serializeMailError(err: unknown) {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    return {
      message: typeof o.message === "string" ? o.message : String(err),
      code: o.code,
      command: o.command,
      responseCode: o.responseCode,
      response: o.response,
    };
  }
  return { message: String(err) };
}

async function notifyTeamSignup(transporter: Transporter, params: {
  email: string;
  formId: string;
  page: string | null;
}) {
  const notifyTo = process.env.WAITLIST_NOTIFY_TO?.trim() || "info@primerisedrinks.com";
  const from = mailFromAddress();
  const meta = getSignupMeta(params.formId);
  const imageUrl = toAbsoluteUrl(meta.imagePath);
  const pageText = params.page || "Not provided";
  const subject = `New Prime Rise signup: ${meta.interest}`;

  await transporter.sendMail({
    from,
    to: notifyTo,
    replyTo: params.email,
    subject,
    text: [
      "A new signup was received on Prime Rise.",
      "",
      `Email: ${params.email}`,
      `Interest: ${meta.interest}`,
      `Details: ${meta.details}`,
      `Image: ${imageUrl}`,
      `Form ID: ${params.formId || "N/A"}`,
      `Page: ${pageText}`,
      `Received at: ${new Date().toISOString()}`,
    ].join("\n"),
  });
}

async function notifySubscriberSignup(transporter: Transporter, params: {
  email: string;
  formId: string;
}) {
  const senderEmail = mailFromAddress();
  const from = `"Prime Rise" <${senderEmail}>`;
  const meta = getSignupMeta(params.formId);
  const heroImage = getHeroImageMeta();
  const subject = "You're on the Prime Rise list";

  const textBody = [
    "Hi there,",
    "",
    "Thanks for joining the Prime Rise waitlist. We received your email and you're enlisted for updates tied to:",
    "",
    `• ${meta.interest}`,
    `Details: ${meta.details}`,
    `Image: ${heroImage.url}`,
    `Learn more: ${meta.linkUrl || getSiteUrl()}`,
    "",
    "We'll reach out at this address when there's news about what you asked for — launches, availability, and Prime Rise botanical blends.",
    "",
    "Questions? Contact us through our website.",
    "",
    "— Prime Rise",
    getSiteUrl(),
  ].join("\n");

  const htmlBody = `
<p>Hi there,</p>
<p>Thanks for joining the <strong>Prime Rise</strong> waitlist. We received your email and you're enlisted for updates tied to:</p>
<p><strong>${escapeHtml(meta.interest)}</strong></p>
<p>${escapeHtml(meta.details)}</p>
<p><img src="${heroImage.url}" alt="${escapeHtml(heroImage.alt)}" width="600" style="width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" /></p>
<p><a href="${meta.linkUrl || getSiteUrl()}" style="color:#0b63ce;text-decoration:underline;">View on Prime Rise</a></p>
<p>We'll reach out at this address when there's news about what you asked for — launches, availability, and Prime Rise botanical blends.</p>
<p>Questions? Contact us through our website.</p>
<p>— Prime Rise<br /><a href="${getSiteUrl()}">${getSiteUrl()}</a></p>
`.trim();

  await transporter.sendMail({
    from,
    to: params.email,
    replyTo: process.env.WAITLIST_SUBSCRIBER_REPLY_TO?.trim() || "no-reply@primerisedrinks.com",
    subject,
    text: textBody,
    html: htmlBody,
  });
}

async function markSubscriberConfirmed(supabase: any, email: string) {
  const result = await supabase
    .from("waitlist")
    .update({ confirmation_sent_at: new Date().toISOString() } as any)
    .eq("email", email);

  if (result.error) {
    console.error("waitlist mark confirmation:", result.error);
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body && String(body._gotcha ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const emailRaw = body && body.email != null ? String(body.email) : "";
  const email = emailRaw.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const page = body.page != null ? String(body.page).slice(0, 2048) : null;
  let formId = "";
  if (body.form_id) {
    formId = String(body.form_id).slice(0, 256);
  } else if (body._subject) {
    formId = String(body._subject).slice(0, 256);
  }

  const row = {
    email,
    page,
    form_id: formId || null,
  };

  const serviceUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const primaryUrl = serviceUrl || anonUrl;
  const primaryKey = serviceKey || anonKey;

  if (!primaryUrl || !primaryKey) {
    return NextResponse.json(
      { error: "Signup is not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const supabase = createClient(primaryUrl, primaryKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await supabase.from("waitlist").insert(row);
  let isDuplicate = false;

  if (result.error) {
    const code = result.error.code;
    if (
      code === "23505" ||
      (result.error.message && result.error.message.includes("duplicate"))
    ) {
      isDuplicate = true;
      // Email already exists; treat this as a new "enlistment" for the requested product/form.
      const updateResult = await supabase
        .from("waitlist")
        .update({
          page,
          form_id: formId || null,
        })
        .eq("email", email);

      if (updateResult.error) {
        console.error("waitlist duplicate update:", updateResult.error);
        return NextResponse.json(
          { error: "We could not update your signup. Please try again." },
          { status: 500 }
        );
      }
    } else {
      console.error("waitlist insert:", result.error);
      return NextResponse.json(
        { error: "We could not save your email. Please try again." },
        { status: 500 }
      );
    }
  }

  const transporter = createSmtpTransporter();
  if (!transporter) {
    const missing = smtpEnvMissingPieces();
    console.warn(
      "waitlist: SMTP not configured — skipping emails. Missing env:",
      missing.join(", ") || "(unknown)"
    );
  } else {
    try {
      await notifyTeamSignup(transporter, { email, formId, page });
    } catch (notifyError) {
      console.error("waitlist notify team email:", serializeMailError(notifyError));
    }
    try {
      await notifySubscriberSignup(transporter, { email, formId });
      await markSubscriberConfirmed(supabase, email);
    } catch (notifyError) {
      console.error(
        "waitlist notify subscriber email:",
        serializeMailError(notifyError)
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
}
