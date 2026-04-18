import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const EMAIL_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

function safePath(p: string | null, fallback: string) {
  const n = p ?? fallback;
  return n.startsWith("/") ? n : `/${n}`;
}

function parseEmailOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  return EMAIL_TYPES.includes(t as EmailOtpType) ? (t as EmailOtpType) : null;
}

/**
 * Server-side email link handler (PKCE `token_hash` + `type`, or `code`).
 * Cookies are applied to the redirect response so the session survives the round trip.
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
  const type = parseEmailOtpType(searchParams.get("type"));
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const fail = () => NextResponse.redirect(new URL("/login?error=auth", origin));

  if (token_hash && type) {
    const destPath = type === "recovery" ? "/reset-password" : safePath(next, "/account");
    let response = NextResponse.redirect(new URL(destPath, origin));
    try {
      const supabase = createRouteHandlerSupabase(request, response);
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) {
        return response;
      }
    } catch {
      return fail();
    }
    return fail();
  }

  if (code) {
    const destPath = safePath(next, "/account");
    let response = NextResponse.redirect(new URL(destPath, origin));
    try {
      const supabase = createRouteHandlerSupabase(request, response);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return response;
      }
    } catch {
      return fail();
    }
    return fail();
  }

  return fail();
}
