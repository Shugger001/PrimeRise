import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { ProductRow } from "@/lib/types/database";
import { slugify } from "@/lib/slugify";

const productSublineByName: Record<string, string> = {
  "Hibiscus Bloom": "A timeless tradition for modern wellness.",
  "Ginger Citrus": "Energize from within.",
  "Carrot Vital": "Nourish & strengthen.",
  "Golden Restore": "Restore from within.",
  "Moringa Mint": "Revive from within.",
};

const productImageByName: Record<string, string> = {
  "Hibiscus Bloom": "/images/hibiscus-bloom-front-back.png?v=2",
  "Ginger Citrus": "/images/ginger-citrus-front-back.png?v=2",
  "Carrot Vital": "/images/carrot-vital-front-back.png?v=2",
  "Moringa Mint": "/images/moringa-mint-front-back.png?v=2",
};

function HighlightsList({ raw }: { raw: string }) {
  const lines = raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="product-inform__highlights mt-3 list-inside list-disc space-y-1 text-sm text-neutral-800">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

function DescriptionBody({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div className="product-inform__body space-y-3 text-neutral-800">
      {blocks.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function IngredientsBlock({ raw }: { raw: string }) {
  const lines = raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) {
    return <p className="text-sm leading-relaxed text-neutral-800">{raw.trim()}</p>;
  }
  return (
    <ul className="product-inform__highlights mt-2 list-inside list-disc space-y-1 text-sm text-neutral-800">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export function ProductGridFromDb({ products }: { products: ProductRow[] }) {
  if (products.length === 0) {
    return (
      <div className="container">
        <p className="page-hero__lead text-center">
          No products are published yet. Add items in the admin dashboard — they will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((p, index) => {
        const id = slugify(p.name);
        const desc = p.description?.trim() ?? "";
        return (
          <article key={p.id} className="product-card-mini product-card-mini--bottle" id={id}>
            <details className="product-reveal-details">
              <summary className="product-reveal__summary">
                <h2 className="product-card-mini__heading">
                  <span className="product-card-mini__number">{String(index + 1).padStart(2, "0")}</span>
                  <span>{p.name}</span>
                </h2>
                {(() => {
                  const displayImage = productImageByName[p.name] ?? p.image_url;
                  return displayImage ? (
                    <img
                      src={displayImage}
                      width={1024}
                      height={1024}
                      alt=""
                      className="product-card-mini__img"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className="product-card-mini__img flex items-center justify-center bg-neutral-200 text-neutral-500"
                      style={{ aspectRatio: "1", minHeight: "200px" }}
                    >
                      No image
                    </div>
                  );
                })()}
                <span className="eyebrow eyebrow--dark">{p.category?.trim() || "Prime Rise"}</span>
                {productSublineByName[p.name] && (
                  <p className="product-card-mini__subline">
                    {productSublineByName[p.name]}
                  </p>
                )}
                <span className="product-reveal__hint">Click for full product details</span>
              </summary>
              <div className="product-inform">
                {p.serving_size?.trim() && (
                  <p className="mb-3 text-sm font-medium text-neutral-700">{p.serving_size.trim()}</p>
                )}

                <h4 className="product-inform__h">Description</h4>
                {desc ? <DescriptionBody text={desc} /> : <p>Details coming soon.</p>}

                <p className="product-safety mt-4">No preservatives • No artificial ingredients</p>

                {p.highlights?.trim() && (
                  <>
                    <hr className="product-inform__rule" />
                    <h4 className="product-inform__h">Highlights</h4>
                    <HighlightsList raw={p.highlights} />
                  </>
                )}

                {p.ingredients?.trim() && (
                  <>
                    <hr className="product-inform__rule" />
                    <h4 className="product-inform__h">Ingredients</h4>
                    <IngredientsBlock raw={p.ingredients} />
                  </>
                )}

                <hr className="product-inform__rule" />
                {p.price != null && (
                  <>
                    <h4 className="product-inform__h">Price</h4>
                    <p className="product-inform__price">${Number(p.price).toFixed(2)}</p>
                    <hr className="product-inform__rule" />
                  </>
                )}
                <p className="product-inform__stock">In stock: {p.stock ?? 0}</p>
                <AddToCartButton product={p} />
              </div>
            </details>
          </article>
        );
      })}
    </div>
  );
}
