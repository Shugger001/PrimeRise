/**
 * Create a confirmed test user for forgot-password / sign-in QA.
 *
 * Requires in .env.local (or env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run test:auth-user
 *   TEST_USER_EMAIL=you@example.com TEST_USER_PASSWORD='YourPass1!' npm run test:auth-user
 *
 * Then: open /forgot-password on the site and request a reset for that email.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const email =
  process.env.TEST_USER_EMAIL?.trim() || "test-forgot-password@primerisedrinks.com";
const password =
  process.env.TEST_USER_PASSWORD?.trim() || "PrimeRiseTest1!Aa";

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (add to .env.local).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  if (String(error.message || "").toLowerCase().includes("already")) {
    console.log(`User already exists: ${email}`);
    console.log("Use /forgot-password on the site to test the reset flow, or pick a new TEST_USER_EMAIL.");
    process.exit(0);
  }
  console.error(error.message || error);
  process.exit(1);
}

console.log("Test user created (email confirmed).");
console.log("");
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log("");
console.log("Next:");
console.log("  1. Open your site → /forgot-password");
console.log("  2. Enter that email → Send reset link");
console.log("  3. Use the link from the email to set a new password");
console.log("");
if (data?.user?.id) {
  console.log(`  User id: ${data.user.id}`);
}
