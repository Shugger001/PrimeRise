# Prime Rise

Marketing site for **Prime Rise** botanical beverages ([primerisedrinks.com](https://primerisedrinks.com/)) plus a **Next.js** admin area at **`/admin`**.

- **Public site:** static HTML/CSS/JS in **`public/`** (`/`, `/faq.html`, …). **Products** catalog is **`/products`** (Next.js route; reads rows from Supabase). **`/products.html`** redirects to **`/products`**.
- **API:** Next.js Route Handlers — **`POST /api/subscribe`** (waitlist), **`POST /api/admin/upload`** (images), **`POST /api/checkout/create-session`** (Stripe Checkout), **`POST /api/webhooks/stripe`** (record orders + decrement stock).
- **Shop:** **`/cart`** (localStorage cart) → **Stripe Checkout** → **`/checkout/success`** / **`/checkout/cancel`**.
- **Accounts:** **`/register`**, **`/login`**, **`/account`** (order history for purchases made while signed in). Same Supabase Auth as admin; admins use **`/admin/login`**.
- **Admin:** Supabase Auth + dashboard for **products**, **categories**, **orders**, **content**.

## Requirements

- **Node.js 20+** recommended
- **Supabase** project with migrations applied (see below)

## Run locally

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_* , SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm run dev
# http://localhost:3000  → marketing site
# http://localhost:3000/admin/login  → admin (after DB + user setup)
```

`npm run dev` runs **Next.js**. The homepage **`/`** is rewritten internally to **`/index.html`** from `public/` (URL bar stays `/`).

### Legacy: static files only

To open HTML without Next (limited: no `/api`, no `/admin`):

```bash
python3 -m http.server 8080 --directory public
```

## Build & deploy (Vercel)

```bash
npm run build   # production build
npm run start   # run production server locally
```

In **Vercel**, set **Framework Preset** to **Next.js** (or rely on auto-detection). Configure environment variables:

| Variable | Use |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser + server) |
| `SUPABASE_URL` | Same URL as above (server: waitlist API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **server only**, waitlist + webhooks |
| `WAITLIST_NOTIFY_TO` | Email that receives signup notifications (e.g. `info@primerisedrinks.com`) |
| `WAITLIST_NOTIFY_FROM` | Sender address for notification emails |
| `WAITLIST_SUBSCRIBER_REPLY_TO` | Optional **Reply-To** on subscriber confirmation emails (defaults to `WAITLIST_NOTIFY_TO`) |
| `ACCOUNT_WELCOME_FROM` | Optional sender address for account-signup welcome emails (`/register`) |
| `ACCOUNT_WELCOME_REPLY_TO` | Optional Reply-To for account-signup welcome emails (default: `no-reply@primerisedrinks.com`) |
| `SMTP_HOST` | SMTP hostname for outbound email delivery |
| `SMTP_PORT` | SMTP port (`587` for STARTTLS, `465` for SSL) |
| `SMTP_SECURE` | `true` for SSL (`465`), otherwise `false` |
| `SMTP_USER` | SMTP username/login |
| `SMTP_PASS` | SMTP password/app password |
| `STRIPE_SECRET_KEY` | Stripe secret key ([Dashboard → API keys](https://dashboard.stripe.com/apikeys)) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from Stripe webhook endpoint |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for Stripe redirects (e.g. `https://primerisedrinks.com`) |

`vercel.json` sets security headers and redirects (www → apex, `/index.html` → `/`).

## Supabase setup

1. Run **`supabase/migrations/001_waitlist.sql`** (waitlist table) if not already applied.
2. Run **`supabase/migrations/013_waitlist_confirmation_tracking.sql`** — adds **`confirmation_sent_at`** so backfilled waitlist emails are only sent once.
3. Run **`supabase/migrations/002_admin_products_content.sql`** — creates `products`, `categories`, `content`, RLS, and **`product-images`** storage bucket.
4. Run **`supabase/migrations/003_orders_checkout.sql`** — `orders` + `order_items` for Stripe fulfillment.
5. Run **`supabase/migrations/004_user_accounts_orders.sql`** — `orders.user_id` + RLS so customers can read their own orders.
6. Run **`supabase/migrations/005_seed_prime_products.sql`** — seeds the five **Prime Rise Collection** blends on `/products` if those product names are not already in the table.
7. Run **`supabase/migrations/006_product_detail_fields.sql`** — adds **ingredients / highlights / serving size** columns, sets **$6.99** for all products, and fills full copy for the five default blends.
8. Run **`supabase/migrations/007_user_roles.sql`** — creates **`public.user_roles`** (`app_role`: **`admin`** | **`customer`**), rewires **`is_admin()`** to use it (not JWT metadata), backfills from legacy **`app_metadata.role`**, and defaults new Auth users to **customer**.
9. In **Authentication → URL configuration**, add redirect URLs: **`http://localhost:3000/auth/callback`** and your production **`https://your-domain/auth/callback`** (needed for email confirmation links).
10. In **Authentication → Users**, create a user (email/password) for admin, or use **Sign up** on the site for a customer account.
11. Grant **admin** in the SQL editor (uses **`user_id`**, separate from customer accounts):

```sql
insert into public.user_roles (user_id, app_role)
values (
  (select id from auth.users where email = 'your-admin@email.com'),
  'admin'
)
on conflict (user_id) do update set app_role = excluded.app_role;
```

12. Sign in at **`/admin/login`** (admins) or **`/login`** (store customers).

### Stripe webhook (production)

1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**.
2. URL: **`https://primerisedrinks.com/api/webhooks/stripe`** (your real domain).
3. Event: **`checkout.session.completed`**.
4. Copy the **Signing secret** into **`STRIPE_WEBHOOK_SECRET`** in Vercel.

For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Routes (store + admin)

| Path | Purpose |
|------|---------|
| `/register` | Create a customer account (also sends account welcome email) |
| `/login` | Customer sign-in (admins are redirected to **`/admin/dashboard`**) |
| `/account` | Profile email + orders placed while signed in |
| `/auth/callback` | Supabase email confirmation / OAuth callback |
| `/admin/login` | Admin sign-in |
| `/admin/dashboard` | Product count + stock sum |
| `/admin/products` | CRUD products; optional image upload to Storage |
| `/admin/categories` | Category names |
| `/admin/orders` | Paid orders from Stripe |
| `/admin/content` | Key/value strings |

Admin access is determined by **`public.user_roles.app_role = 'admin'`** (same `user_id` as Supabase Auth, different role than **`customer`**). The app does **not** rely on JWT **`app_metadata`** for authorization. Middleware sends non-admins who use **`/admin/login`** to **`/account`**.

## Configure before production

1. **Analytics** — Set **`data-ga-id`** on each page’s `<html>` in `public/*.html` for GA4.
2. **Waitlist** — Forms use **`data-form-endpoint="/api/subscribe"`**; requires **`SUPABASE_URL`** + **`SUPABASE_SERVICE_ROLE_KEY`** on the server. Set **`WAITLIST_NOTIFY_TO`**, **`WAITLIST_NOTIFY_FROM`**, and **`SMTP_*`** so the team gets each signup and the **subscriber** gets a confirmation that reflects what they signed up for (section/form). Optional **`WAITLIST_SUBSCRIBER_REPLY_TO`** controls Reply-To on those confirmations.
3. **Account welcome email** — New users from **`/register`** trigger **`POST /api/account-signup-welcome`** (separate template from waitlist). Uses **`SMTP_*`** and optional **`ACCOUNT_WELCOME_FROM`** / **`ACCOUNT_WELCOME_REPLY_TO`**.
4. **Contact** — **`info@primerisedrinks.com`** in footer/FAQ; update if needed.
5. **Legal** — Review **`public/privacy.html`** and **`public/terms.html`**.
6. **Checkout** — Set **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`NEXT_PUBLIC_SITE_URL`**, apply migrations through **`007`**, and register the webhook URL above.

### Waitlist email not arriving

1. **Vercel** — Add **`SMTP_HOST`**, **`SMTP_USER`**, **`SMTP_PASS`**, **`SMTP_PORT`**, **`SMTP_SECURE`** under **Production** (not only Preview). **Redeploy** after saving env vars.
2. **From address** — Set **`WAITLIST_NOTIFY_FROM`** to the **same mailbox you authenticate** (`SMTP_USER`), or another address your provider explicitly allows as a sender. A random `no-reply@…` that is not verified with your SMTP account is often **rejected silently or blocked**.
3. **Duplicate test** — If that email is **already** in the `waitlist` table, the API returns success but **does not send** confirmation emails again. Use a **new address** or delete the row in Supabase to retest.
4. **Microsoft 365 / Outlook** — In the admin center, ensure **SMTP AUTH** / **Authenticated SMTP** is **enabled** for that mailbox (org policy often disables it by default).
5. **Google Workspace** — Use a 16‑character **App Password** for **`SMTP_PASS`** (2‑Step Verification required), not your normal login password.
6. **Logs** — In Vercel → **Deployments** → **Functions** → **`/api/subscribe`**, look for **`waitlist notify`** lines. Errors include SMTP **`responseCode`** (e.g. 535 auth failure, 554 rejected).

### Backfill missed confirmations

After applying **`supabase/migrations/013_waitlist_confirmation_tracking.sql`**, you can send confirmation emails to older waitlist subscribers who were stored before SMTP was fixed:

```bash
# Preview who will be emailed
npm run waitlist:backfill-confirmations -- --dry-run

# Send to all subscribers missing confirmation_sent_at
npm run waitlist:backfill-confirmations

# Optional filters
npm run waitlist:backfill-confirmations -- --since=2026-04-01T00:00:00Z --limit=100
```

The script uses **`SUPABASE_URL`**, **`SUPABASE_SERVICE_ROLE_KEY`**, and the same **`SMTP_*`** / **`WAITLIST_*`** env vars as the live waitlist API. Each successful email stamps **`confirmation_sent_at`** so reruns are safe.

#### Alternative (no local env): trigger via Vercel endpoint

If you can't run the backfill script locally, you can trigger it from Vercel (production) with the admin endpoint:

- `POST /api/admin/backfill-waitlist-confirmations`
- Header: `Authorization: Bearer <WAITLIST_BACKFILL_SECRET>`
- Body (JSON): `{ "dryRun": true, "limit": 50, "since": "2026-04-01T00:00:00Z" }`

Example with curl:
```bash
curl -X POST "https://prime-rise.vercel.app/api/admin/backfill-waitlist-confirmations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WAITLIST_BACKFILL_SECRET" \
  -d '{"dryRun":true,"limit":20}'
```

## CI

[GitHub Actions](.github/workflows/ci.yml) runs on pushes/PRs: file checks under **`public/`**, **`npm run build`**, and manifest/sitemap validation.

## License / content

Site content and imagery are for the Prime Rise brand; use only as authorized.
