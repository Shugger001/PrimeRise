"use client";

import type { CategoryRow } from "@/lib/types/database";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function CategoriesManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialCategories);

  useEffect(() => {
    setRows(initialCategories);
  }, [initialCategories]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products may still reference the name as text.")) return;
    startTransition(async () => {
      setError(null);
      const res = await deleteCategoryAction(id);
      if (!res.ok) {
        setError(res.message ?? "Delete failed");
        return;
      }
      setRows((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    });
  }

  async function submitCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setError(null);
      const res = await createCategoryAction(fd);
      if (!res.ok) {
        setError(res.message ?? "Failed");
        return;
      }
      e.currentTarget.reset();
      setOpen(false);
      router.refresh();
    });
  }

  async function submitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setError(null);
      const res = await updateCategoryAction(editing.id, fd);
      if (!res.ok) {
        setError(res.message ?? "Failed");
        return;
      }
      const name = String(fd.get("name") ?? "").trim();
      setRows((prev) => prev.map((x) => (x.id === editing.id ? { ...x, name } : x)));
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setEditing(null);
            setError(null);
          }}
          className="w-full rounded-lg bg-admin-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-admin-accentDeep font-sans sm:w-auto"
        >
          Add category
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[420px] text-left text-[0.95rem] md:text-sm">
          <thead className="border-b border-admin-border bg-admin-head text-[0.72rem] uppercase text-admin-muted md:text-xs">
            <tr>
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-admin-muted">
                  No categories yet.
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-4 text-admin-ink">{c.name}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c);
                      setOpen(false);
                      setError(null);
                    }}
                    className="mr-2 min-h-9 rounded-md px-2 text-admin-accent hover:bg-[rgba(79,92,56,0.08)] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(c.id)}
                    disabled={pending}
                    className="min-h-9 rounded-md px-2 text-red-700 hover:bg-red-50 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#2d3322]/45 p-3 pt-6 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-[var(--color-bg-deep)]">New category</h2>
            <form onSubmit={(e) => void submitCreate(e)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="new-name" className="text-sm text-admin-muted md:text-xs">
                  Name
                </label>
                <input
                  id="new-name"
                  name="name"
                  required
                  className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
                  placeholder="e.g. Botanical blends"
                />
              </div>
              <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-2 border-t border-admin-border bg-admin-surface/95 px-6 py-3 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-10 rounded-lg border border-admin-border px-4 py-2 text-sm text-neutral-700 font-sans hover:bg-[rgba(79,92,56,0.06)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-10 rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:bg-admin-accentDeep font-sans"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#2d3322]/45 p-3 pt-6 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-[var(--color-bg-deep)]">Edit category</h2>
            <form onSubmit={(e) => void submitEdit(e)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-name" className="text-sm text-admin-muted md:text-xs">
                  Name
                </label>
                <input
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={editing.name}
                  className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
                />
              </div>
              <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-2 border-t border-admin-border bg-admin-surface/95 px-6 py-3 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="min-h-10 rounded-lg border border-admin-border px-4 py-2 text-sm text-neutral-700 font-sans hover:bg-[rgba(79,92,56,0.06)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-10 rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:bg-admin-accentDeep font-sans"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
