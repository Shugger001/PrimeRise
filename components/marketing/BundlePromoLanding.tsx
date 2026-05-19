"use client";

import type { StripePaymentLinkItem } from "@/lib/stripe-payment-links";
import { BUNDLE_COUNTDOWN_DAYS } from "@/lib/bundle-promo";
import { BUNDLE_LANDING_BLENDS } from "@/lib/bundle-landing-blends";
import { useEffect, useRef, useState } from "react";

type Props = {
  bundle: StripePaymentLinkItem | null;
  fourBottleBundle: StripePaymentLinkItem | null;
  twelveBottleBundle: StripePaymentLinkItem | null;
  showProductGrid: boolean;
  /** Optional link under hero CTAs (e.g. home → products anchor) */
  microLink?: { href: string; label: string };
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function BundlePromoLanding({
  bundle,
  fourBottleBundle,
  twelveBottleBundle,
  showProductGrid,
  microLink,
}: Props) {
  const primaryHref = bundle?.href ?? (showProductGrid ? "#hibiscus-bloom" : "mailto:info@primerisedrinks.com");
  const fourBottleHref = fourBottleBundle?.href ?? "mailto:info@primerisedrinks.com";
  const twelveBottleHref = twelveBottleBundle?.href ?? "mailto:info@primerisedrinks.com";
  const primaryLabel = bundle ? "Shop the Six-Bottle Bundle" : showProductGrid ? "Browse individual blends" : "Email to order";

  const defaultMicro =
    showProductGrid ?
      { href: "#hibiscus-bloom", label: "Explore individual blends below" }
    : { href: "mailto:info@primerisedrinks.com", label: "Questions? Email us" };
  const resolvedMicro = microLink ?? defaultMicro;

  const [endAt, setEndAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const heroRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const e = new Date();
    e.setDate(e.getDate() + BUNDLE_COUNTDOWN_DAYS);
    setEndAt(e.getTime());
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  let dd = "00";
  let hh = "00";
  let mm = "00";
  let ss = "00";
  if (endAt !== null) {
    const ms = Math.max(0, endAt - now);
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    dd = pad2(Math.min(days, 99));
    hh = pad2(hours);
    mm = pad2(minutes);
    ss = pad2(seconds);
  }

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.classList.add("bundle-landing__hero--visible"));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".bundle-landing__blend-card.js-io");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add("is-visible");
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    nodes.forEach((n) => obs.observe(n));

    const showcase = showcaseRef.current;
    let lo: IntersectionObserver | null = null;
    if (showcase) {
      lo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) showcase.classList.add("bundle-landing__showcase--in");
          });
        },
        { threshold: 0.12 }
      );
      lo.observe(showcase);
    }

    return () => {
      nodes.forEach((n) => obs.unobserve(n));
      obs.disconnect();
      lo?.disconnect();
    };
  }, []);

  useEffect(() => {
    stripRef.current?.classList.add("bundle-landing__strip--tick");
    const t = window.setTimeout(() => stripRef.current?.classList.remove("bundle-landing__strip--tick"), 380);
    return () => window.clearTimeout(t);
  }, [ss]);

  return (
    <section id="six-bottle-bundle" className="bundle-landing" aria-labelledby="bundle-landing-hero-title">
      <div ref={heroRef} className="bundle-landing__hero bundle-landing__block">
        <div className="bundle-landing__hero-decor bundle-landing__hero-decor--tl" aria-hidden="true">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path
              d="M60 10 C35 30 20 55 25 80 C30 100 50 110 60 105 C70 110 90 100 95 80 C100 55 85 30 60 10Z"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.35"
            />
            <path d="M60 30 L55 70 L60 95 L65 70 Z" fill="currentColor" opacity="0.12" />
          </svg>
        </div>
        <div className="bundle-landing__hero-decor bundle-landing__hero-decor--br" aria-hidden="true">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <ellipse cx="70" cy="70" rx="55" ry="28" stroke="currentColor" strokeWidth="1" opacity="0.25" />
            <path d="M40 85 Q70 45 100 85" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
          </svg>
        </div>
        <div className="bundle-landing__hero-inner">
          <p className="bundle-landing__eyebrow">LIMITED-TIME BUNDLE</p>
          <h1 id="bundle-landing-hero-title" className="bundle-landing__hero-title">
            The Prime Rise Bundle —<span className="bundle-landing__hero-title-break"> All Six Blends</span>
          </h1>
          <p className="bundle-landing__hero-sub">
            One curated box with every signature botanical beverage in our line — ideal for tasting the full ritual or gifting
            the collection.
          </p>
          <div className="bundle-landing__hero-ctas">
            <a
              href={primaryHref}
              className="bundle-landing__btn bundle-landing__btn--primary"
              rel={bundle ? "noopener noreferrer" : undefined}
            >
              {primaryLabel}
            </a>
            <a
              href={fourBottleHref}
              className="bundle-landing__btn bundle-landing__btn--primary"
              rel={fourBottleBundle ? "noopener noreferrer" : undefined}
            >
              Shop the 4-Bottle Bundle
            </a>
            <a
              href={twelveBottleHref}
              className="bundle-landing__btn bundle-landing__btn--primary"
              rel={twelveBottleBundle ? "noopener noreferrer" : undefined}
            >
              Shop the 12-Bottle Bundle
            </a>
            <a href="#bundle-whats-inside" className="bundle-landing__btn bundle-landing__btn--ghost">
              View Full Details
            </a>
          </div>
          <div className="bundle-landing__offer-grid" aria-label="Bundle offer highlights">
            <article className="bundle-landing__offer-card">
              <p className="bundle-landing__offer-badge">@ $44</p>
              <h3 className="bundle-landing__offer-title">6-Bottle Bundle Offer</h3>
              <a
                href={primaryHref}
                className="bundle-landing__btn bundle-landing__btn--offer"
                rel={bundle ? "noopener noreferrer" : undefined}
              >
                Shop 6-Bottle Bundle
              </a>
            </article>
            <article className="bundle-landing__offer-card">
              <p className="bundle-landing__offer-badge">@ $30</p>
              <h3 className="bundle-landing__offer-title">4-Bottle Bundle Offer</h3>
              <a href={fourBottleHref} className="bundle-landing__btn bundle-landing__btn--offer" rel={fourBottleBundle ? "noopener noreferrer" : undefined}>
                Shop 4-Bottle Bundle
              </a>
            </article>
            <article className="bundle-landing__offer-card">
              <p className="bundle-landing__offer-badge">@ $88</p>
              <h3 className="bundle-landing__offer-title">12-Bottle Bundle Offer</h3>
              <a
                href={twelveBottleHref}
                className="bundle-landing__btn bundle-landing__btn--offer"
                rel={twelveBottleBundle ? "noopener noreferrer" : undefined}
              >
                Shop 12-Bottle Bundle
              </a>
            </article>
          </div>
          <p className="bundle-landing__micro-link-wrap">
            <a href={resolvedMicro.href} className="bundle-landing__micro-link">
              {resolvedMicro.label}
            </a>
          </p>
        </div>
      </div>

      <div className="bundle-landing__divider" aria-hidden="true" />

      <div ref={showcaseRef} className="bundle-landing__showcase bundle-landing__block">
        <div className="bundle-landing__showcase-stage">
          <figure className="bundle-landing__showcase-figure">
            <img
              src="/images/six-bottle-bundle-hero.png"
              width={1024}
              height={576}
              alt="Prime Rise six bottle bundle — all six botanical blends"
              className="bundle-landing__showcase-img"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="bundle-landing__float-labels">
            {BUNDLE_LANDING_BLENDS.map((b, i) => (
              <div
                key={b.slug}
                className={`bundle-landing__float-label bundle-landing__float-label--p${i + 1}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="bundle-landing__float-line" aria-hidden="true" />
                <div className="bundle-landing__float-card">
                  <span className="bundle-landing__float-name">{b.name}</span>
                  <span className="bundle-landing__float-desc">{b.showcaseDescriptor}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bundle-landing__mobile-names" role="list" aria-label="Blends in this bundle">
            {BUNDLE_LANDING_BLENDS.map((b) => (
              <span key={b.slug} className="bundle-landing__mobile-name-chip" role="listitem">
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bundle-landing__divider" aria-hidden="true" />

      <div id="bundle-whats-inside" className="bundle-landing__grid-section bundle-landing__block">
        <h2 className="bundle-landing__section-title">What&apos;s Inside the Bundle</h2>
        <div className="bundle-landing__blend-grid">
          {BUNDLE_LANDING_BLENDS.map((b, i) => (
            <article
              key={b.slug}
              className="bundle-landing__blend-card js-io"
              style={{ transitionDelay: `${Math.min(i, 5) * 70}ms` }}
            >
              <div className="bundle-landing__blend-swatch" style={{ backgroundColor: b.swatch }} />
              <h3 className="bundle-landing__blend-name">
                {showProductGrid ? (
                  <a href={`/products#${b.slug}`}>{b.name}</a>
                ) : (
                  <span>{b.name}</span>
                )}
              </h3>
              <p className="bundle-landing__blend-flavour">{b.flavourLine}</p>
              <p className="bundle-landing__blend-benefit">{b.benefit}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="bundle-landing__divider" aria-hidden="true" />

      <div className="bundle-landing__values bundle-landing__block">
        <div className="bundle-landing__values-inner">
          <div className="bundle-landing__value-col">
            <span className="bundle-landing__value-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="26" r="14" stroke="#1C3A2A" strokeWidth="1.5" opacity="0.85" />
                <path d="M24 12v6M18 18l6 6 6-6" stroke="#C9913D" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="bundle-landing__value-title">6 Signature Blends</h3>
            <p className="bundle-landing__value-text">One of every flavour in the full Prime Rise line.</p>
          </div>
          <div className="bundle-landing__value-col">
            <span className="bundle-landing__value-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M14 28c4 6 10 10 10 10s6-4 10-10c4-8 2-16-4-20-4-3-8-2-10 2-2-4-6-5-10-2-6 4-8 12-4 20z"
                  stroke="#1C3A2A"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.9"
                />
              </svg>
            </span>
            <h3 className="bundle-landing__value-title">Curated Six-Bottle Box</h3>
            <p className="bundle-landing__value-text">One complete bundle with all six signature blends.</p>
          </div>
          <div className="bundle-landing__value-col">
            <span className="bundle-landing__value-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="12" y="14" width="24" height="22" rx="2" stroke="#1C3A2A" strokeWidth="1.5" opacity="0.85" />
                <path d="M16 18h16M16 24h10" stroke="#C9913D" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="bundle-landing__value-title">Perfect for Gifting</h3>
            <p className="bundle-landing__value-text">Arrives in a curated, gift-ready presentation.</p>
          </div>
        </div>
      </div>

      <div className="bundle-landing__divider" aria-hidden="true" />

      <div ref={stripRef} className="bundle-landing__strip" role="contentinfo">
        <div className="bundle-landing__strip-inner">
          <div className="bundle-landing__strip-copy">
            <p className="bundle-landing__strip-urgent">Limited-time offer — bundle pricing ends soon</p>
            <div className="bundle-landing__countdown">
              <div className="bundle-landing__count-unit">
                <span className="bundle-landing__count-num">{dd}</span>
                <span className="bundle-landing__count-label">Days</span>
              </div>
              <span className="bundle-landing__count-sep" aria-hidden="true">
                :
              </span>
              <div className="bundle-landing__count-unit">
                <span className="bundle-landing__count-num">{hh}</span>
                <span className="bundle-landing__count-label">Hours</span>
              </div>
              <span className="bundle-landing__count-sep" aria-hidden="true">
                :
              </span>
              <div className="bundle-landing__count-unit">
                <span className="bundle-landing__count-num">{mm}</span>
                <span className="bundle-landing__count-label">Mins</span>
              </div>
              <span className="bundle-landing__count-sep" aria-hidden="true">
                :
              </span>
              <div className="bundle-landing__count-unit">
                <span className="bundle-landing__count-num">{ss}</span>
                <span className="bundle-landing__count-label">Secs</span>
              </div>
            </div>
          </div>
          <a
            href="/products#six-bottle-bundle"
            className="bundle-landing__btn bundle-landing__btn--gold"
            id="sixBoxBundleCta"
          >
            Shop the Bundle
          </a>
        </div>
      </div>

      <a href="#six-bottle-bundle" className="bundle-landing__floating-bubble" aria-label="Jump to bundle offer section">
        Bundle Offer
      </a>
    </section>
  );
}
