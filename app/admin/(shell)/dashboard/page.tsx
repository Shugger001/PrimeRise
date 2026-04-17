import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase.from("products").select("id, stock");
  const { data: pendingReviews } = await supabase
    .from("customer_reviews")
    .select("id")
    .eq("status", "pending");

  const count = rows?.length ?? 0;
  const stockSum =
    rows?.reduce((acc, r) => acc + (typeof r.stock === "number" ? r.stock : 0), 0) ?? 0;
  const pendingReviewCount = pendingReviews?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)]">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-muted">Overview of your catalog</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load products: {error.message}. Run the SQL migration in Supabase if you have not yet.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">Total products</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-bg-deep)]">{count}</p>
        </div>
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">Stock on hand</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-bg-deep)]">{stockSum}</p>
        </div>
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">Pending reviews</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-bg-deep)]">
            {pendingReviewCount}
          </p>
        </div>
      </div>
    </div>
  );
}
