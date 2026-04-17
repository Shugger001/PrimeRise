"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      const err =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : null;

      if (!res.ok) {
        setMessage(err || "Could not send reset link. Try again in a moment.");
        return;
      }

      setSent(true);
    } catch {
      setMessage("Network error. Check your connection or try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
      <h1 className="font-serif text-2xl text-[var(--color-bg-deep)]">Forgot password</h1>
      <p className="mt-1 text-sm text-neutral-600">Enter your email and we will send you a reset link.</p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            If an account exists for <span className="font-medium">{email}</span>, a password reset link has been sent.
          </p>
          <p className="text-center text-sm text-neutral-600">
            <Link href="/login" className="font-medium text-[var(--color-bg-deep)] underline">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-bg-deep)]"
            />
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button type="submit" disabled={loading} className="btn btn--primary w-full justify-center disabled:opacity-50">
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-center text-sm text-neutral-600">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-[var(--color-bg-deep)] underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
