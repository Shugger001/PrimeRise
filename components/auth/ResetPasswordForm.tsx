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
  if (score <= 2) return { label: "Weak", color: "bg-red-500", score, checks };
  if (score <= 4) return { label: "Medium", color: "bg-amber-500", score, checks };
  return { label: "Strong", color: "bg-emerald-500", score, checks };
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const strength = getStrengthMeta(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const checks = getPasswordChecks(password);
    if (!Object.values(checks).every(Boolean)) {
      setMessage("Use at least 8 characters with uppercase, lowercase, number, and symbol.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
      <h1 className="font-serif text-2xl text-[var(--color-bg-deep)]">Set new password</h1>
      <p className="mt-1 text-sm text-neutral-600">Choose a new password for your Prime Rise account.</p>

      {success ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Your password has been updated.</p>
          <p className="text-center text-sm text-neutral-600">
            <Link href="/account" className="font-medium text-[var(--color-bg-deep)] underline">
              Continue to account
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
              New password
            </label>
            <div className="relative mt-1">
              <input
                id="new-password"
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
          <div>
            <label
              htmlFor="confirm-new-password"
              className="block text-xs font-medium uppercase tracking-wide text-neutral-600"
            >
              Confirm password
            </label>
            <div className="relative mt-1">
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-14 text-sm outline-none focus:ring-2 focus:ring-[var(--color-bg-deep)]"
              />
              <button
                type="button"
                aria-pressed={showConfirmPassword}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-[var(--color-bg-deep)] underline decoration-neutral-400 underline-offset-2 hover:bg-neutral-50"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button type="submit" disabled={loading} className="btn btn--primary w-full justify-center disabled:opacity-50">
            {loading ? "Updating…" : "Update password"}
          </button>
          <p className="text-center text-sm text-neutral-600">
            Back to{" "}
            <Link href="/login" className="font-medium text-[var(--color-bg-deep)] underline">
              sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
