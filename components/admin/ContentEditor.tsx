"use client";

import type { ContentRow } from "@/lib/types/database";
import { upsertContentAction } from "@/app/admin/content/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = { initialEntries: ContentRow[] };

export function ContentEditor({ initialEntries }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setMessage(null);
      setError(null);
      const res = await upsertContentAction(fd);
      if (!res.ok) {
        setError(res.message ?? "Save failed");
        return;
      }
      setMessage("Saved.");
      const key = String(fd.get("key") ?? "");
      const value = String(fd.get("value") ?? "");
      setEntries((prev) => {
        const i = prev.findIndex((x) => x.key === key);
        if (i === -1) return [...prev, { id: "", key, value }];
        const next = [...prev];
        next[i] = { ...next[i], value };
        return next;
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card"
      >
        <h2 className="font-serif text-base font-semibold text-[var(--color-bg-deep)]">Add or update entry</h2>
        <p className="mt-1 text-sm text-admin-muted md:text-xs">Use a stable key (e.g. hero.headline, hero.subhead)</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="key" className="text-sm font-medium text-admin-muted md:text-xs">
              Key
            </label>
            <input
              id="key"
              name="key"
              required
              pattern="[a-zA-Z0-9._-]+"
              className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
              placeholder="hero.headline"
            />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="value" className="text-sm font-medium text-admin-muted md:text-xs">
            Value
          </label>
          <textarea
            id="value"
            name="value"
            rows={4}
            required
            className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-lg bg-admin-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-admin-accentDeep disabled:opacity-50 font-sans sm:w-auto"
        >
          {pending ? "Saving…" : "Save entry"}
        </button>
        {message && <p className="mt-2 text-sm text-emerald-800">{message}</p>}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </form>

      <div className="rounded-2xl border border-admin-border bg-admin-surface shadow-card">
        <div className="border-b border-admin-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-admin-muted">
          Current keys
        </div>
        <ul className="divide-y divide-admin-border">
          {entries.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-admin-muted">No content rows yet.</li>
          )}
          {entries.map((row) => (
            <li key={row.id || row.key} className="px-4 py-4 text-sm">
              <span className="font-mono text-admin-accent">{row.key}</span>
              <p className="mt-1 line-clamp-3 text-admin-muted">{row.value}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
