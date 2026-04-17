"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Suspense, useEffect, useState } from "react";

/** `token_hash` + `type` query params (PKCE email links) — must match `EmailOtpType`. */
function parseEmailOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  const allowed: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];
  return allowed.includes(raw as EmailOtpType) ? (raw as EmailOtpType) : null;
}

/**
 * Supabase may return:
 * - PKCE email links: `?token_hash=...&type=recovery&next=...` (password reset / confirm — see Supabase password docs)
 * - PKCE OAuth: `?code=...&next=...`
 * - Implicit: `#access_token=...&refresh_token=...&type=recovery`
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();

      const nextRaw = searchParams.get("next") ?? "/account";
      const next = nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`;

      const token_hash = searchParams.get("token_hash");
      const otpType = parseEmailOtpType(searchParams.get("type"));

      if (token_hash && otpType) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: otpType });
        if (error) {
          if (!cancelled) {
            setStatus("error");
            router.replace("/login?error=auth");
          }
          return;
        }
        const dest = otpType === "recovery" ? "/reset-password" : next;
        router.replace(dest);
        router.refresh();
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            setStatus("error");
            router.replace("/login?error=auth");
          }
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
      if (hash) {
        const params = new URLSearchParams(hash);
        const oauthError = params.get("error") ?? params.get("error_code");
        if (oauthError) {
          if (!cancelled) {
            setStatus("error");
            router.replace("/login?error=auth");
          }
          return;
        }

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            if (!cancelled) {
              setStatus("error");
              router.replace("/login?error=auth");
            }
            return;
          }

          const path = window.location.pathname + window.location.search;
          window.history.replaceState(null, "", path);

          const dest = type === "recovery" ? "/reset-password" : next;
          router.replace(dest);
          router.refresh();
          return;
        }
      }

      if (!cancelled) {
        setStatus("error");
        router.replace("/login?error=auth");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

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
