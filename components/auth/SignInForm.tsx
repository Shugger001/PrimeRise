"use client";

import { getAppRoleForUser } from "@/lib/auth/user-role";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const next = searchParams.get("next") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role = user ? await getAppRoleForUser(supabase, user.id) : null;
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push(next.startsWith("/") ? next : `/${next}`);
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
      <h1 className="font-serif text-2xl text-[var(--color-bg-deep)]">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-600">Access your account and order history.</p>

      {err === "config" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </p>
      )}
      {err === "auth" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
          Email link expired or invalid. Try signing in with your password.
        </p>
      )}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="signin-email" className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-[var(--color-bg-deep)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="signin-password" className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-14 text-sm outline-none focus:ring-2 focus:ring-[var(--color-bg-deep)]"
            />
            <button
              type="button"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-[var(--color-bg-deep)] underline decoration-neutral-400 underline-offset-2 hover:bg-neutral-50"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <p className="text-right text-sm">
          <Link href="/forgot-password" className="font-medium text-[var(--color-bg-deep)] underline">
            Forgot password?
          </Link>
        </p>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn--primary w-full justify-center disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-[var(--color-bg-deep)] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
