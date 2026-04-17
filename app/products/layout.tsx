import type { Metadata } from "next";
import "../marketing.css";

export const metadata: Metadata = {
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
