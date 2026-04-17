import type { CustomerReviewRow, ReviewStatus } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

export async function listCustomerReviews(
  limit = 200
): Promise<{ data: CustomerReviewRow[] | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data ?? []) as CustomerReviewRow[], error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function updateCustomerReviewStatus(
  id: string,
  status: ReviewStatus
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("customer_reviews").update({ status }).eq("id", id);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function deleteCustomerReview(id: string): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("customer_reviews").delete().eq("id", id);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
