"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Suspense, useEffect, useState } from "react";

/** `token_hash` + `type` query params (PKCE email links) — must match `EmailOtpType`. */
function parseEmailOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  const allowed: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];
  return allowed.includes(raw as EmailOtpType) ? (raw as EmailOtpType) : null;
}

function hardNavigate(path: string) {
  const url = path.startsWith("http") ? path : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
  window.location.assign(url);
}

/**
 * Fallback for legacy links and implicit/hash flows. Prefer server `/auth/confirm` for `token_hash` + `code`.
 *
 * - Implicit: `#access_token=...&refresh_token=...&type=recovery`
 * - Older email links may still target `/auth/callback?token_hash=...`
 */
function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      hardNavigate("/login?error=auth");
    }, 25000);

    async function run() {
      try {
        const supabase = createClient();

        const nextRaw = searchParams.get("next") ?? "/account";
        const next = nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`;

        const token_hash = searchParams.get("token_hash");
        const otpType = parseEmailOtpType(searchParams.get("type"));

        if (token_hash && otpType) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: otpType });
          if (error) {
            setStatus("error");
            hardNavigate("/login?error=auth");
            return;
          }
          const dest = otpType === "recovery" ? "/reset-password" : next;
          window.clearTimeout(timeoutId);
          hardNavigate(dest);
          return;
        }

        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("error");
            hardNavigate("/login?error=auth");
            return;
          }
          window.clearTimeout(timeoutId);
          hardNavigate(next);
          return;
        }

        const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
        if (hash) {
          const params = new URLSearchParams(hash);
          const oauthError = params.get("error") ?? params.get("error_code");
          if (oauthError) {
            setStatus("error");
            hardNavigate("/login?error=auth");
            return;
          }

          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          const type = params.get("type");

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) {
              setStatus("error");
              hardNavigate("/login?error=auth");
              return;
            }

            const path = window.location.pathname + window.location.search;
            window.history.replaceState(null, "", path);

            const dest = type === "recovery" ? "/reset-password" : next;
            window.clearTimeout(timeoutId);
            hardNavigate(dest);
            return;
          }
        }

        setStatus("error");
        hardNavigate("/login?error=auth");
      } catch {
        setStatus("error");
        hardNavigate("/login?error=auth");
      }
    }

    void run();
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchParams]);

  if (status === "error") {
    return null;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4">
      <p className="text-sm text-neutral-600">Completing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-neutral-600">Loading…</div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
