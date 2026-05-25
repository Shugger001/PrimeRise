"use client";

import { useEffect } from "react";

/** Opens the matching product <details> when the URL hash is a product slug (e.g. /products#hibiscus-bloom). */
export function OpenProductFromHash() {
  useEffect(() => {
    function openFromHash() {
      const slug = window.location.hash.replace(/^#/, "").trim();
      if (!slug) return;

      const article = document.getElementById(slug);
      if (!article) return;

      const details = article.querySelector("details.product-reveal-details");
      if (!(details instanceof HTMLDetailsElement)) return;

      details.open = true;
      window.requestAnimationFrame(() => {
        article.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return null;
}
