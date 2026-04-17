"use client";

import type { ProductRow } from "@/lib/types/database";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = { initialProducts: ProductRow[] };

export function ProductsManager({ initialProducts }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setError(null);
    setOpen(true);
  }

  function openEdit(p: ProductRow) {
    setEditing(p);
    setError(null);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    startTransition(async () => {
      setError(null);
      const res = await deleteProductAction(id);
      if (!res.ok) {
        setError(res.message ?? "Delete failed");
        return;
      }
      setProducts((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="w-full rounded-lg bg-admin-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-admin-accentDeep font-sans sm:w-auto"
        >
          Add product
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface shadow-card">
        <table className="w-full min-w-[680px] text-left text-[0.95rem] md:text-sm">
          <thead className="border-b border-admin-border bg-admin-head text-[0.72rem] uppercase tracking-wide text-admin-muted md:text-xs">
            <tr>
              <th className="px-4 py-3.5 font-medium">Name</th>
              <th className="px-4 py-3.5 font-medium">Category</th>
              <th className="px-4 py-3.5 font-medium">Price</th>
              <th className="px-4 py-3.5 font-medium">Stock</th>
              <th className="px-4 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-admin-muted">
                  No products yet. Add one to get started.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[rgba(79,92,56,0.05)]">
                <td className="px-4 py-4 font-medium text-admin-ink">{p.name}</td>
                <td className="px-4 py-4 text-admin-muted">{p.category ?? "—"}</td>
                <td className="px-4 py-4 tabular-nums text-neutral-700">
                  {p.price != null ? `$${Number(p.price).toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-4 tabular-nums text-neutral-700">{p.stock ?? 0}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="mr-2 min-h-9 rounded-md px-2 text-admin-accent hover:bg-[rgba(79,92,56,0.08)] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(p.id)}
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

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {open && (
        <ProductModal initial={editing} onClose={() => setOpen(false)} onError={setError} />
      )}
    </div>
  );
}

function ProductModal({
  initial,
  onClose,
  onError,
}: {
  initial: ProductRow | null;
  onClose: () => void;
  onError: (s: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      onError(null);
      const res = initial
        ? await updateProductAction(initial.id, fd)
        : await createProductAction(fd);
      if (!res.ok) {
        onError("message" in res && res.message ? res.message : "Validation failed");
        return;
      }
      onClose();
      /* Re-fetch would be cleaner; refresh router updates RSC */
      window.location.reload();
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = (await r.json()) as { publicUrl?: string; error?: string };
      if (!r.ok) {
        onError(j.error ?? "Upload failed");
        return;
      }
      const input = document.querySelector<HTMLInputElement>('input[name="image_url"]');
      if (input && j.publicUrl) input.value = j.publicUrl;
    } catch {
      onError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#2d3322]/45 p-3 pt-6 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-[var(--color-bg-deep)]">
          {initial ? "Edit product" : "New product"}
        </h2>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
          <Field label="Name" name="name" required defaultValue={initial?.name} />
          <div>
            <label className="block text-sm font-medium text-admin-muted md:text-xs">Description</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={initial?.description ?? ""}
              placeholder="Full story for the expandable panel (use blank lines between paragraphs)."
              className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-muted md:text-xs">Highlights (one per line)</label>
            <textarea
              name="highlights"
              rows={4}
              defaultValue={initial?.highlights ?? ""}
              placeholder="Bullet-style lines shown under Highlights"
              className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-muted md:text-xs">Ingredients</label>
            <textarea
              name="ingredients"
              rows={3}
              defaultValue={initial?.ingredients ?? ""}
              placeholder="As on label (comma-separated or short sentences)"
              className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
            />
          </div>
          <Field label="Serving size" name="serving_size" defaultValue={initial?.serving_size ?? ""} />
          <Field label="Price" name="price" type="number" step="0.01" defaultValue={initial?.price ?? ""} />
          <Field label="Category" name="category" defaultValue={initial?.category ?? ""} />
          <Field label="Stock" name="stock" type="number" defaultValue={initial?.stock ?? 0} />
          <div>
            <label className="block text-sm font-medium text-admin-muted md:text-xs">Image URL</label>
            <input
              name="image_url"
              type="url"
              defaultValue={initial?.image_url ?? ""}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-3 text-base text-admin-ink md:py-2.5 md:text-sm"
            />
            <p className="mt-1 text-xs text-admin-muted">Or upload a file (stored in Supabase Storage)</p>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => void onFileChange(e)}
              className="mt-2 block w-full text-xs text-admin-muted file:mr-2 file:rounded file:border-0 file:bg-admin-head file:px-2 file:py-1 file:text-admin-ink"
            />
            {uploading && <p className="text-xs text-admin-muted">Uploading…</p>}
          </div>
          <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-2 border-t border-admin-border bg-admin-surface/95 px-6 py-3 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-lg border border-admin-border px-4 py-2 text-sm text-neutral-700 font-sans hover:bg-[rgba(79,92,56,0.06)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-10 rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:bg-admin-accentDeep disabled:opacity-50 font-sans"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  step,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-admin-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue as string | number | undefined}
        className="mt-1 w-full rounded-lg border border-admin-border bg-white px-3 py-2.5 text-sm text-admin-ink"
      />
    </div>
  );
}
