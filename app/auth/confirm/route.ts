import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const EMAIL_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

function safePath(p: string | null, fallback: string) {
  const n = p ?? fallback;
  return n.startsWith("/") ? n : `/${n}`;
}

/**
 * Server-side email link handler (PKCE `token_hash` + `type`, or `code`).
 * Avoids relying on client JS + App Router navigation in in-app browsers (often hangs on "Completing sign-in…").
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  const token_hash = searchParams.get("token_hash");
  const typeRaw = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const type =
    typeRaw && EMAIL_TYPES.includes(typeRaw as EmailOtpType) ? (typeRaw as EmailOtpType) : null;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      const dest = type === "recovery" ? "/reset-password" : safePath(next, "/account");
      return NextResponse.redirect(new URL(dest, origin));
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safePath(next, "/account"), origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
