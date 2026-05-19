import { SHIPPING_INFO } from "@/lib/shipping-info";

type ShippingInfoProps = {
  className?: string;
  compact?: boolean;
};

export function ShippingInfo({ className = "", compact = false }: ShippingInfoProps) {
  return (
    <aside
      className={`rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-card)] px-4 py-3 text-sm text-neutral-700 ${className}`.trim()}
      aria-label={SHIPPING_INFO.headline}
    >
      <p className="font-medium text-[var(--color-bg-deep)]">{SHIPPING_INFO.headline}</p>
      <ul className={`mt-2 list-disc space-y-1 text-neutral-700 ${compact ? "pl-4" : "pl-5"}`}>
        {SHIPPING_INFO.bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  );
}
