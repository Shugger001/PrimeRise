export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  /** Statement of ingredients (label-style). */
  ingredients?: string | null;
  /** Newline-separated bullet lines for the details panel. */
  highlights?: string | null;
  /** e.g. "12 FL OZ (355 mL)" */
  serving_size?: string | null;
  price: number | null;
  image_url: string | null;
  category: string | null;
  stock: number | null;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
};

export type ContentRow = {
  id: string;
  key: string;
  value: string | null;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type CustomerReviewRow = {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  review: string;
  source: string;
  status: ReviewStatus;
  page: string | null;
  created_at: string;
};

export type OrderRow = {
  id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  user_id: string | null;
  status: string;
  currency: string;
  amount_total_cents: number | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  created_at: string;
};
