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
| [Cloudflare Pages](https://developers.cloudflare.com/pages/) | `_headers` |

## Configure before production

- **`data-ga-id`** on `<html>`: set your GA4 measurement ID (omit or leave empty to skip analytics).
- **`data-form-endpoint`** on `<html>`: set your form endpoint (e.g. [Formspree](https://formspree.io/)) for email signups; empty = demo toasts only.
- **`privacy.html`** / **`terms.html`**: attorney review (starter copy).
- Replace placeholder wholesale/contact email in content when the client finalizes the inbox.

## CI

[GitHub Actions](.github/workflows/ci.yml) runs on pushes and PRs to `main` / `master`: verifies core files, key images, and shared UI markers exist.

## License / content

Site content and imagery are for the Prime Rise brand; use only as authorized by the client.
