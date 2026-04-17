"use client";

import { usePathname } from "next/navigation";
import { WhatsAppBubble } from "@/components/marketing/WhatsAppBubble";

/** Renders the floating WhatsApp link on marketing/store routes; hidden in /admin. */
export function WhatsAppBubbleGate() {
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;
  return <WhatsAppBubble />;
}
