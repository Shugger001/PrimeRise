"use client";

import { getAppRoleForUser } from "@/lib/auth/user-role";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (role !== "admin") {
      await supabase.auth.signOut();
      setMessage("This account is not authorized for admin access.");
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-8 shadow-card">
      <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)]">Sign in</h1>
      <p className="mt-1 text-sm text-admin-muted">Prime Rise admin dashboard</p>

      {err === "config" && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Supabase environment variables are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </p>
      )}
      {err === "forbidden" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          You do not have access to this area.
        </p>
      )}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wide text-admin-muted font-sans"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-ink outline-none ring-admin-accent/30 placeholder:text-neutral-400 focus:ring-2 focus:ring-admin-accent"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium uppercase tracking-wide text-admin-muted font-sans"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-admin-ink outline-none focus:ring-2 focus:ring-admin-accent"
          />
        </div>
        {message && <p className="text-sm text-red-700">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-admin-accent py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-admin-accentDeep disabled:opacity-50 font-sans"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
