import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getGaId() {
  return (
    process.env.NEXT_PUBLIC_PRIME_RISE_GA_ID?.trim() ||
    process.env.PRIME_RISE_GA_ID?.trim() ||
    ""
  );
}

/** Public site flags for static marketing pages (GA4 measurement ID, etc.). */
export async function GET() {
  const gaId = getGaId();
  return NextResponse.json(
    { gaId: gaId || null },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
