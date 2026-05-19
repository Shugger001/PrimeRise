export type BundleBlendCard = {
  name: string;
  slug: string;
  flavourLine: string;
  swatch: string;
  benefit: string;
  /** Label line under product name in showcase */
  showcaseDescriptor: string;
};

/** Order matches six-bottle hero image left → right for floating label positions */
export const BUNDLE_LANDING_BLENDS: BundleBlendCard[] = [
  {
    name: "Hibiscus Bloom",
    slug: "hibiscus-bloom",
    flavourLine: "Floral · Refreshing · Vital",
    swatch: "#C0324A",
    benefit: "A floral ritual rooted in tradition—crafted to refresh and uplift.",
    showcaseDescriptor: "Floral · Refreshing",
  },
  {
    name: "Ginger Citrus",
    slug: "ginger-citrus",
    flavourLine: "Tangy · Warming · Energising",
    swatch: "#E8841A",
    benefit: "Bright citrus and ginger to energize from the first sip.",
    showcaseDescriptor: "Tangy · Warming",
  },
  {
    name: "Carrot Vital",
    slug: "carrot-vital",
    flavourLine: "Earthy · Sweet · Nourishing",
    swatch: "#D4641A",
    benefit: "Earthy sweetness and vitamins for everyday nourishment.",
    showcaseDescriptor: "Earthy · Sweet",
  },
  {
    name: "Golden Restore",
    slug: "golden-restore",
    flavourLine: "Turmeric · Citrus · Restore",
    swatch: "#D4A017",
    benefit: "Turmeric and citrus to support recovery and balance.",
    showcaseDescriptor: "Turmeric · Restore",
  },
  {
    name: "Moringa Mint",
    slug: "moringa-mint",
    flavourLine: "Herbal · Cool · Detox",
    swatch: "#3A7D44",
    benefit: "Cool herbs and moringa for a crisp, grounded reset.",
    showcaseDescriptor: "Herbal · Cool",
  },
  {
    name: "Pear Vital",
    slug: "pear-vital",
    flavourLine: "Light · Hydrating · Smooth",
    swatch: "#8DB548",
    benefit: "Light, hydrating focus—smooth clarity in every pour.",
    showcaseDescriptor: "Light · Hydrating",
  },
];
