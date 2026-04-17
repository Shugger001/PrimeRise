"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Supabase may return either:
 * - PKCE: `?code=...&next=...` (server-visible; we also handle here for one code path)
 * - Recovery / implicit: `#access_token=...&refresh_token=...&type=recovery` (hash is NOT sent to Route Handlers)
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

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setStatus("error");
          router.replace("/login?error=auth");
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
          if (cancelled) return;
          if (error) {
            setStatus("error");
            router.replace("/login?error=auth");
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
