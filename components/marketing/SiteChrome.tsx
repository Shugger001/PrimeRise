import { AuthNav } from "@/components/auth/AuthNav";
import { CartNavLink } from "@/components/cart/CartNavLink";
import Link from "next/link";
import Script from "next/script";

/**
 * Header / footer / shell shared with static marketing pages (class names from styles.css).
 */
export function SiteChrome({
  children,
  activeNav,
}: {
  children: React.ReactNode;
  activeNav: "products" | "default";
}) {
  const productsCurrent = activeNav === "products";

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div
        className="cookie-banner"
        id="cookieBanner"
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookieBannerTitle"
        aria-describedby="cookieBannerDesc"
      >
        <div className="cookie-banner__inner">
          <h4 className="cookie-banner__title" id="cookieBannerTitle">
            This website uses cookies.
          </h4>
          <p className="cookie-banner__text" id="cookieBannerDesc">
            We use cookies to analyze website traffic and optimize your website experience. By accepting our use of
            cookies, your data will be aggregated with all other user data.{" "}
            <Link href="/privacy.html" className="cookie-banner__link">
              Privacy Policy
            </Link>
            .
          </p>
          <button type="button" className="btn btn--cookie" id="acceptCookies">
            Accept
          </button>
        </div>
      </div>

      <header className="site-header" id="siteHeader">
        <Link href="/" className="logo" aria-label="Prime Rise home">
          <span className="logo__mark" aria-hidden="true">
            <svg className="logo__svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M24 8v4M24 26v4M14 18h4M30 18h4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M24 32c-4 2-8 6-8 12h16c0-6-4-10-8-12z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="logo__text">Prime Rise</span>
        </Link>
        <div className="site-header__center">
          <nav className="site-header__tablet-nav" aria-label="Popular pages">
            <Link href="/products" className="nav__link" aria-current={productsCurrent ? "page" : undefined}>
              Products
            </Link>
            <span className="site-header__tablet-dot" aria-hidden>
              ·
            </span>
            <Link href="/faq.html" className="nav__link">
              FAQ
            </Link>
          </nav>
        </div>
        <nav className="nav" aria-label="Primary">
          <span className="nav__cluster">
            <CartNavLink />
            <AuthNav />
          </span>
          <Link href="/products" className="nav__link" aria-current={productsCurrent ? "page" : undefined}>
            Products
          </Link>
          <Link href="/#collection" className="nav__link">
            Collection
          </Link>
          <Link href="/#golden-restore" className="nav__link">
            Golden Restore
          </Link>
          <Link href="/#story" className="nav__link">
            Our story
          </Link>
          <Link href="/faq.html" className="nav__link">
            FAQ
          </Link>
          <Link href="/#join" className="nav__link nav__link--cta">
            Begin your ritual
          </Link>
        </nav>
        <div className="site-header__tail">
          <div className="site-header__quick" aria-label="Quick links">
            <CartNavLink />
            <AuthNav />
          </div>
          <button
            type="button"
            className="nav-toggle"
            id="navToggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="mobileNav"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="nav-backdrop" id="navBackdrop" hidden aria-hidden="true" tabIndex={-1}></div>
      <div className="mobile-nav" id="mobileNav" role="navigation" aria-label="Mobile menu" hidden data-mobile-nav>
        <Link href="/cart">Cart</Link>
        <Link href="/login">Sign in</Link>
        <Link href="/account">Account</Link>
        <Link href="/products">Products</Link>
        <Link href="/#collection">Collection</Link>
        <Link href="/#golden-restore">Golden Restore</Link>
        <Link href="/#story">Our story</Link>
        <Link href="/faq.html">FAQ</Link>
        <Link href="/#join">Begin your ritual</Link>
      </div>

      {children}

      <footer className="site-footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <Link href="/" className="logo logo--footer">
              <span className="logo__mark" aria-hidden="true">
                <svg className="logo__svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M24 8v4M24 26v4M14 18h4M30 18h4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24 32c-4 2-8 6-8 12h16c0-6-4-10-8-12z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className="logo__text">Prime Rise</span>
            </Link>
            <p className="footer__tagline">Rise In Your Prime</p>
          </div>
          <div className="footer__contact">
            <h3 className="footer__heading">Connect</h3>
            <a href="https://www.primerisedrinks.com/" className="footer__link" rel="noopener noreferrer">
              www.primerisedrinks.com
            </a>
            <p className="footer__location">HOUSTON TX</p>
            <p className="footer__updates">
              <Link href="/#join">Launch updates</Link>
              <span aria-hidden="true"> · </span>
              <a href="mailto:info@primerisedrinks.com?subject=Prime%20Rise%20inquiry">Contact</a>
            </p>
          </div>
          <div className="footer__trust">
            <a href="https://www.trustedsite.com/" className="trust-badge" target="_blank" rel="noopener noreferrer" aria-label="TrustedSite">
              <span className="trust-badge__shield" aria-hidden="true">
                <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 0L2 6v9c0 8.5 5.2 16.4 12 17 6.8-.6 12-8.5 12-17V6L14 0z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path d="M9 16l3 3 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="trust-badge__text">
                <span className="trust-badge__title">TrustedSite</span>
                <span className="trust-badge__sub">Certified secure</span>
              </span>
            </a>
          </div>
        </div>
        <div className="container footer__legal">
          <Link href="/products">Products</Link>
          <Link href="/faq.html">FAQ</Link>
          <Link href="/privacy.html">Privacy Policy</Link>
          <Link href="/terms.html">Terms of Use</Link>
          <Link href="/admin/login" className="footer__legal-link--admin" title="Staff sign in">
            Admin
          </Link>
        </div>
        <div className="container footer__bottom">
          <p className="footer__note">
            Email signups are for launch news from Prime Rise. See our <Link href="/privacy.html">Privacy Policy</Link>.
          </p>
          <p>© 2026 Prime Rise. All Rights Reserved.</p>
        </div>
      </footer>

      <button type="button" className="back-to-top" id="backToTop" hidden aria-label="Back to top">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>

      <div className="toast" id="toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>

      <Script async src="https://cdn.trustedsite.com/js/1.js?position=bottomLeft&offset=15" crossOrigin="anonymous" />
      <Script src="/main.js" strategy="afterInteractive" />
    </>
  );
}
