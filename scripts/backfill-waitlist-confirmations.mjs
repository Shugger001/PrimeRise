import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "https://primerisedrinks.com";
}

function toAbsoluteUrl(pathOrUrl) {
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSignupMeta(formId = "") {
  const normalized = String(formId || "").trim().toLowerCase();
  const siteUrl = getSiteUrl();

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
        details: "Early access for what’s next. We will reach out when it is ready.",
        imagePath: "/images/ginger-citrus-coming-soon.jpeg",
        imageAlt: "Ginger Citrus — coming soon",
        linkUrl: siteUrl,
      };
    default:
      return {
        interest: formId ? `Waitlist (${formId})` : "Prime Rise waitlist",
        details: "Thanks for joining Prime Rise — we will reach out soon with updates.",
        imagePath: "/images/lifestyle-wellness-elevated.png?v=4",
        imageAlt: "Prime Rise botanical beverages",
        linkUrl: siteUrl,
      };
  }
}

function mailFromAddress() {
  return (
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
    throw new Error("Missing SMTP env: SMTP_HOST, SMTP_USER, or SMTP_PASS.");
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

async function notifySubscriberSignup(transporter, row) {
  const senderEmail = mailFromAddress();
  const from = `"Prime Rise" <${senderEmail}>`;
  const meta = getSignupMeta(row.form_id || "");
  const heroImage = getHeroImageMeta();

  await transporter.sendMail({
    from,
    to: row.email,
    replyTo: process.env.WAITLIST_SUBSCRIBER_REPLY_TO?.trim() || "no-reply@primerisedrinks.com",
    subject: "You're on the Prime Rise list",
    text: [
      "Hi there,",
      "",
      "Thanks for joining the Prime Rise waitlist. We received your email and you're enlisted for updates tied to:",
      "",
      `- ${meta.interest}`,
      `Details: ${meta.details}`,
      `Image: ${heroImage.url}`,
      `Learn more: ${meta.linkUrl || getSiteUrl()}`,
      "",
      "We'll reach out at this address when there's news about what you asked for - launches, availability, and Prime Rise botanical blends.",
      "",
      "Questions? Contact us through our website.",
      "",
      "- Prime Rise",
      getSiteUrl(),
    ].join("\n"),
    html: [
      "<p>Hi there,</p>",
      "<p>Thanks for joining the <strong>Prime Rise</strong> waitlist. We received your email and you're enlisted for updates tied to:</p>",
      `<p><strong>${escapeHtml(meta.interest)}</strong></p>`,
      `<p>${escapeHtml(meta.details)}</p>`,
      `<p><img src="${heroImage.url}" alt="${escapeHtml(heroImage.alt)}" width="600" style="width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" /></p>`,
      `<p><a href="${meta.linkUrl || getSiteUrl()}" style="color:#0b63ce;text-decoration:underline;">View on Prime Rise</a></p>`,
      "<p>We'll reach out at this address when there's news about what you asked for - launches, availability, and Prime Rise botanical blends.</p>",
      "<p>Questions? Contact us through our website.</p>",
      `<p>- Prime Rise<br /><a href="${getSiteUrl()}">${getSiteUrl()}</a></p>`,
    ].join(""),
  });
}

function getArg(name, fallback = "") {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : fallback;
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const limit = Number(getArg("limit", "500"));
  const dryRun = process.argv.includes("--dry-run");
  const since = getArg("since");

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let query = supabase
    .from("waitlist")
    .select("id, email, form_id, created_at, confirmation_sent_at")
    .is("confirmation_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (since) {
    query = query.gte("created_at", since);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = data || [];
  console.log(`Found ${rows.length} waitlist rows without confirmation emails.`);
  if (!rows.length) {
    return;
  }

  if (dryRun) {
    for (const row of rows) {
      const meta = getSignupMeta(row.form_id || "");
      console.log(`DRY RUN ${row.email} <- ${meta.interest}`);
    }
    return;
  }

  const transporter = createSmtpTransporter();
  let sent = 0;

  for (const row of rows) {
    await notifySubscriberSignup(transporter, row);
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ confirmation_sent_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("confirmation_sent_at", null);

    if (updateError) {
      throw updateError;
    }

    sent += 1;
    console.log(`Sent confirmation to ${row.email}`);
  }

  console.log(`Done. Sent ${sent} confirmation emails.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
