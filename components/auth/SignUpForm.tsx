"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function getStrengthMeta(password: string) {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;
  if (score <= 2) return { label: "Weak", color: "bg-red-500", score };
  if (score <= 4) return { label: "Medium", color: "bg-amber-500", score };
  return { label: "Strong", color: "bg-emerald-500", score };
}

function emailRedirectUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/confirm?next=/account`;
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return base ? `${base}/auth/confirm?next=/account` : "";
}

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const strength = getStrengthMeta(password);

  async function sendAccountWelcomeEmail(targetEmail: string) {
    try {
      await fetch("/api/account-signup-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
    } catch {
      // Do not block sign-up completion if welcome email fails.
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const checks = getPasswordChecks(password);
    if (!Object.values(checks).every(Boolean)) {
      setMessage("Use at least 8 characters with uppercase, lowercase, number, and symbol.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const redirectTo = emailRedirectUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      await sendAccountWelcomeEmail(email);
      router.push("/account");
      router.refresh();
      setLoading(false);
      return;
    }
    await sendAccountWelcomeEmail(email);
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="font-serif text-2xl text-[var(--color-bg-deep)]">Check your email</h1>
        <p className="mt-3 text-sm text-neutral-600">
          We sent a confirmation link to <span className="font-medium">{email}</span>. Open it to activate your account,
          then sign in.
        </p>
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-[var(--color-bg-deep)] underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
      <h1 className="font-serif text-2xl text-[var(--color-bg-deep)]">Create account</h1>
      <p className="mt-1 text-sm text-neutral-600">Save your details and see orders placed while signed in.</p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-bg-deep)]"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
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
          <div className="mt-2">
            <div className="h-2 w-full rounded-full bg-neutral-200">
              <div
                className={`h-2 rounded-full transition-all ${strength.color}`}
                style={{ width: `${Math.max(10, (strength.score / 5) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-600">Password strength: {strength.label}</p>
            <p className="mt-1 text-xs text-neutral-500">
              Use at least 8 characters with uppercase, lowercase, number, and symbol.
            </p>
          </div>
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn--primary w-full justify-center disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--color-bg-deep)] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
