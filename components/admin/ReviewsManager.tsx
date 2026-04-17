"use client";

import { deleteReviewAction, setReviewStatusAction } from "@/app/admin/reviews/actions";
import type { CustomerReviewRow, ReviewStatus } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Props = { initialReviews: CustomerReviewRow[] };

export function ReviewsManager({ initialReviews }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r) => r.status === filter)),
    [filter, reviews]
  );

  function badgeClass(status: ReviewStatus) {
    if (status === "approved") return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (status === "rejected") return "bg-rose-50 text-rose-800 border-rose-200";
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  async function setStatus(id: string, status: ReviewStatus) {
    startTransition(async () => {
      setError(null);
      const res = await setReviewStatusAction(id, status);
      if (!res.ok) {
        setError(res.message ?? "Could not update review status.");
        return;
      }
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      router.refresh();
    });
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    startTransition(async () => {
      setError(null);
      const res = await deleteReviewAction(id);
      if (!res.ok) {
        setError(res.message ?? "Could not delete review.");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border border-admin-border bg-white p-1 text-sm">
          {(["all", "pending", "approved", "rejected"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-lg px-3 py-1.5 capitalize ${
                filter === option ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-head"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-sm text-admin-muted">{filtered.length} review(s)</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-surface shadow-card">
        <table className="w-full min-w-[920px] text-left text-[0.95rem] md:text-sm">
          <thead className="border-b border-admin-border bg-admin-head text-[0.72rem] uppercase tracking-wide text-admin-muted md:text-xs">
            <tr>
              <th className="px-4 py-3.5 font-medium">Reviewer</th>
              <th className="px-4 py-3.5 font-medium">Rating</th>
              <th className="px-4 py-3.5 font-medium">Review</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-4 py-3.5 font-medium">Date</th>
              <th className="px-4 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-admin-muted">
                  No reviews in this filter.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="align-top hover:bg-[rgba(79,92,56,0.05)]">
                <td className="px-4 py-4">
                  <p className="font-medium text-admin-ink">{r.name}</p>
                  <p className="mt-1 text-xs text-admin-muted">{r.email ?? "No email provided"}</p>
                </td>
                <td className="px-4 py-4 tabular-nums text-admin-ink">{"★".repeat(Math.max(1, r.rating))}</td>
                <td className="px-4 py-4 text-admin-muted">
                  <p className="line-clamp-4 max-w-[36ch]">{r.review}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${badgeClass(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-admin-muted">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      disabled={pending || r.status === "approved"}
                      onClick={() => void setStatus(r.id, "approved")}
                      className="min-h-9 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={pending || r.status === "rejected"}
                      onClick={() => void setStatus(r.id, "rejected")}
                      className="min-h-9 rounded-md border border-rose-200 bg-rose-50 px-2 text-xs font-medium text-rose-800 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={pending || r.status === "pending"}
                      onClick={() => void setStatus(r.id, "pending")}
                      className="min-h-9 rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-medium text-amber-800 disabled:opacity-50"
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void deleteReview(r.id)}
                      className="min-h-9 rounded-md border border-admin-border bg-white px-2 text-xs font-medium text-admin-muted hover:bg-admin-head disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
