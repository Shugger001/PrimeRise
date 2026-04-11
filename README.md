# Prime Rise

Static marketing site for **Prime Rise** botanical beverages ([primerisedrinks.com](https://primerisedrinks.com/)). Built as plain **HTML**, **CSS**, and **vanilla JavaScript**—no build step.

## Run locally

From this folder:

```bash
# Option A: open the homepage directly
open index.html

# Option B: simple local server (avoids file:// quirks for prefetch/manifest)
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Deploy

**Production is [Vercel](https://vercel.com/docs).** Every push to **`main`** should update the live site once the project is connected (see below). `vercel.json` defines headers and static settings (no build step).

### One-time: link GitHub → Vercel

1. Sign in at [vercel.com](https://vercel.com) (same GitHub account as the repo).
2. **Add New… → Project** → **Import** [Shugger001/PrimeRise](https://github.com/Shugger001/PrimeRise).
3. **Framework Preset:** Other (or “No framework”). **Root Directory:** `./` (repository root).
4. **Build Command:** leave empty (or Vercel will respect `buildCommand: null` in `vercel.json`).
5. **Output Directory:** leave default / empty — `index.html` at the repo root is the site entry.
6. **Production Branch:** `main`. Deploy.

After that, **any merge or push to `main`** triggers a new production deployment. Pull requests against the repo typically get **preview deployments** automatically.

**Day-to-day workflow:** change the site in this repo → `git commit` → `git push origin main` → open the project in the [Vercel dashboard](https://vercel.com/dashboard) and confirm the latest deployment under **Deployments** (status should be **Ready**).

### Custom domain (e.g. primerisedrinks.com)

In your Vercel project: **Settings → Domains** → add `primerisedrinks.com` and `www.primerisedrinks.com`, then set DNS at your registrar to the records Vercel shows (usually **A** / **CNAME**). Keep **HTTPS** enabled. Align the **primary** domain with the canonical URLs already used in `index.html` (`https://primerisedrinks.com/`).

`vercel.json` includes **301 redirects** so requests to `www.primerisedrinks.com` go to the apex host, and `/index.html` goes to `/` (matches canonical URLs and avoids duplicate URLs in search indexes).

### Manual deploy (CLI)

If you use the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel login
npx vercel link   # once, in this repo
npx vercel --prod # production deploy
```

### Other hosts (optional)

| Platform | Config file |
|----------|-------------|
| [Netlify](https://docs.netlify.com/) | `netlify.toml` |
| [Cloudflare Pages](https://developers.cloudflare.com/pages/) | `_headers`, `_redirects` |

`_redirects` (repo root) mirrors the **www → apex** and **`/index.html` → `/`** rules from `vercel.json` for hosts that read that file (Netlify, Cloudflare Pages). **Apache** users get the same behavior via `.htaccess` `mod_rewrite`.

## Configure before production

### Launch checklist

1. **Analytics** — Set **`data-ga-id`** on every page’s `<html>` to your GA4 measurement ID (e.g. `G-XXXXXXXXXX`), or leave empty to skip loading gtag. Analytics runs after visitors accept cookies (or immediately if they already accepted).
2. **Signups** — Set **`data-form-endpoint`** on `<html>` to your endpoint (e.g. [Formspree](https://formspree.io/) `https://formspree.io/f/xxxx`). Empty = client-side demo toasts only (no network submit).
3. **Contact email** — Replace the placeholder **`hello@primerisedrinks.com`** everywhere (footer **Contact** `mailto:` and any body copy). Search the repo for `hello@` after you have the final address.
4. **Legal** — Have counsel review and adapt **`privacy.html`** and **`terms.html`** (visible disclaimers already note starter copy).
5. **Spam** — Signup forms get a hidden honeypot (`name="_gotcha"`, `data-prime-hp` in `main.js`). Keep the **`signup-form`** class on those forms; do not remove the injected field.

Details:

- **`data-ga-id`** / **`data-form-endpoint`**: same attributes on `index.html`, `products.html`, `faq.html`, `privacy.html`, `terms.html`, and `404.html` so behavior stays consistent if you later share scripts across pages.
- Honeypot values are included in the JSON POST as **`_gotcha`** when a real endpoint is set (Formspree-compatible). Client-side still aborts if the field is non-empty.

## CI

[GitHub Actions](.github/workflows/ci.yml) runs on pushes and PRs to `main` / `master`: verifies core files, key images, and shared UI markers exist.

## License / content

Site content and imagery are for the Prime Rise brand; use only as authorized by the client.
