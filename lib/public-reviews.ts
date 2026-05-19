import { createClient } from "@supabase/supabase-js";

export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  review: string;
  source: string | null;
  created_at: string;
};

export type PublicReviewsSummary = {
  overall_rating: number | null;
  total_reviews: number;
};

export async function fetchApprovedReviews(limit = 6): Promise<{
  reviews: PublicReview[];
  summary: PublicReviewsSummary;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { reviews: [], summary: { overall_rating: null, total_reviews: 0 } };
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const safeLimit = Math.max(1, Math.min(12, Math.floor(limit)));

  const { data, error } = await supabase
    .from("customer_reviews")
    .select("id,name,rating,review,source,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  const { data: ratingRows, error: ratingError } = await supabase
    .from("customer_reviews")
    .select("rating")
    .eq("status", "approved")
    .limit(2000);

  if (error || ratingError) {
    console.error("fetchApprovedReviews:", error ?? ratingError);
    return { reviews: [], summary: { overall_rating: null, total_reviews: 0 } };
  }

  const ratings = (ratingRows ?? [])
    .map((row) => Number((row as { rating: number }).rating))
    .filter((n) => Number.isFinite(n) && n > 0);
  const totalApproved = ratings.length;
  const overallRating =
    totalApproved > 0 ?
      Number((ratings.reduce((sum, value) => sum + value, 0) / totalApproved).toFixed(1))
    : null;

  return {
    reviews: (data ?? []) as PublicReview[],
    summary: {
      overall_rating: overallRating,
      total_reviews: totalApproved,
    },
  };
}
