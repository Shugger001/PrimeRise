import { CartProvider } from "@/components/cart/CartProvider";
import { GoogleAnalytics } from "@/components/marketing/GoogleAnalytics";
import { WhatsAppBubbleGate } from "@/components/marketing/WhatsAppBubbleGate";
import type { Metadata, Viewport } from "next";
import { Bitter, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const fontBitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  display: "swap",
});

/** UI sans — close to the marketing site’s Droid Sans; next/font has no Droid Sans package */
const fontUi = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const fontPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f1ea",
};

export const metadata: Metadata = {
  title: "Prime Rise",
  description: "Prime Rise botanical beverages",
};

function getGaId() {
  return (
    process.env.NEXT_PUBLIC_PRIME_RISE_GA_ID?.trim() ||
    process.env.PRIME_RISE_GA_ID?.trim() ||
    ""
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = getGaId();
  return (
    <html
      lang="en"
      data-form-endpoint="/api/subscribe"
      data-ga-id={gaId}
      className={`${fontBitter.variable} ${fontUi.variable} ${fontPlayfair.variable}`}
    >
      <body className="min-h-screen bg-white font-body text-neutral-900">
        <CartProvider>
          {children}
          <WhatsAppBubbleGate />
        </CartProvider>
        {gaId ? <GoogleAnalytics measurementId={gaId} /> : null}
      </body>
    </html>
  );
}
