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

The repo includes configs for common hosts (publish directory = **repository root**):

| Platform | Config file |
|----------|-------------|
| [Netlify](https://docs.netlify.com/) | `netlify.toml` |
| [Vercel](https://vercel.com/docs) | `vercel.json` |
| [Cloudflare Pages](https://developers.cloudflare.com/pages/) | `_headers` |

Connect [GitHub](https://github.com/Shugger001/PrimeRise) to your host, set the production branch to **`main`**, and deploy.

## Configure before production

- **`data-ga-id`** on `<html>`: set your GA4 measurement ID (omit or leave empty to skip analytics).
- **`data-form-endpoint`** on `<html>`: set your form endpoint (e.g. [Formspree](https://formspree.io/)) for email signups; empty = demo toasts only.
- **`privacy.html`** / **`terms.html`**: attorney review (starter copy).
- Replace placeholder wholesale/contact email in content when the client finalizes the inbox.

## CI

[GitHub Actions](.github/workflows/ci.yml) runs on pushes and PRs to `main` / `master`: verifies core files, key images, and shared UI markers exist.

## License / content

Site content and imagery are for the Prime Rise brand; use only as authorized by the client.
