import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { listCustomerReviews } from "@/lib/services/reviews";

export default async function AdminReviewsPage() {
  const { data: reviews, error } = await listCustomerReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)]">Reviews</h1>
        <p className="mt-1 text-sm text-admin-muted">Approve or reject customer feedback for homepage display.</p>
      </div>
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error.message}
        </div>
      )}
      <ReviewsManager initialReviews={reviews ?? []} />
    </div>
  );
}
