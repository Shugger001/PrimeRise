"use client";

import Script from "next/script";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const id = measurementId.trim();
  if (!id || id.includes("XXXX")) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
      <Script id="prime-rise-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id.replace(/'/g, "\\'")}');
        `}
      </Script>
    </>
  );
}
