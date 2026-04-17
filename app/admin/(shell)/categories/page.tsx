import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { getCategories } from "@/lib/services/categories";

export default async function AdminCategoriesPage() {
  const { data: categories, error } = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)]">Categories</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Used to organize products (shown as labels on the public products page when set on each product).
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error.message}
        </div>
      )}
      <CategoriesManager initialCategories={categories ?? []} />
    </div>
  );
}
