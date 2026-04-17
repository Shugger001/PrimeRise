import { getProducts } from "@/lib/services/products";
import { ProductsManager } from "@/components/admin/ProductsManager";

export default async function AdminProductsPage() {
  const { data: products, error } = await getProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)]">Products</h1>
        <p className="mt-1 text-sm text-admin-muted">Manage catalog items stored in Supabase</p>
      </div>
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error.message}
        </div>
      )}
      <ProductsManager initialProducts={products ?? []} />
    </div>
  );
}
