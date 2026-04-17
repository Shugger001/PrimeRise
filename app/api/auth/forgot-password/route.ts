import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function redirectToForPasswordReset(request: Request): string {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envBase) {
    return `${envBase}/auth/callback?next=/reset-password`;
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}/auth/callback?next=/reset-password`;
  }
  return new URL("/auth/callback?next=/reset-password", request.url).href;
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim()
      : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectToForPasswordReset(request),
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not send reset link. Try again in a moment." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
