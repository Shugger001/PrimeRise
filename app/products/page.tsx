import { ProductGridFromDb } from "@/components/marketing/ProductGridFromDb";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { createClient, isSupabaseServerEnvConfigured } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import type { ProductRow } from "@/lib/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Prime Rise",
  description:
    "Prime Rise botanical beverages — premium blends crafted as a daily ritual. Nutrition facts and full ingredient statements are on every label.",
  alternates: { canonical: "https://primerisedrinks.com/products" },
  openGraph: {
    title: "Products | Prime Rise",
    url: "https://primerisedrinks.com/products",
    siteName: "PRIME RISE",
    type: "website",
    locale: "en_US",
  },
};

const PRODUCT_DISPLAY_ORDER = ["Hibiscus Bloom", "Ginger Citrus", "Carrot Vital", "Golden Restore", "Moringa Mint"];

export default async function ProductsPage() {
  const catalogConfigured = isSupabaseServerEnvConfigured();
  let products: ProductRow[] = [];
  if (catalogConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    products = (data ?? []) as ProductRow[];
    products = [...products].sort((a, b) => {
      const aIndex = PRODUCT_DISPLAY_ORDER.indexOf(a.name);
      const bIndex = PRODUCT_DISPLAY_ORDER.indexOf(b.name);
      const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Prime Rise botanical beverages",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `https://primerisedrinks.com/products#${slugify(p.name)}`,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://primerisedrinks.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://primerisedrinks.com/products" },
    ],
  };

  return (
    <SiteChrome activeNav="products">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main id="main-content" className="page-main" tabIndex={-1}>
        <section className="products-line-intro" aria-label="Prime Rise products intro">
          <div className="container">
            <figure className="products-line-figure">
              <img
                src="/images/products-line-hero.jpeg"
                width={1024}
                height={1024}
                alt="Prime Rise — real ingredients, real purpose: Hibiscus Bloom bottle with botanical ingredients in kraft bags on stone"
                className="products-line-figure__img"
                fetchPriority="high"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        <header className="page-hero page-hero--products">
          <h2 className="page-hero__title">Our Blends</h2>
          <p className="page-hero__lead">
            Premium botanical beverages—each crafted as a daily ritual. Nutrition facts and full ingredient statements are on
            every label.
          </p>
          <p className="page-hero__lead font-semibold">Receive One Complimentary Bottle with Every 5 Selected.</p>
        </header>

        {!catalogConfigured && (
          <p className="container mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Our product catalog can’t load right now because the storefront isn’t connected to the database. Please try again
            later or contact us at{" "}
            <a href="mailto:info@primerisedrinks.com" className="underline">
              info@primerisedrinks.com
            </a>
            .
          </p>
        )}

        {catalogConfigured && <ProductGridFromDb products={products} />}
      </main>
    </SiteChrome>
  );
}
