import { assertAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderItemRow, OrderRow } from "@/lib/types/database";

export type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

export async function getOrdersForAdmin(): Promise<{
  data: OrderWithItems[] | null;
  error: Error | null;
}> {
  try {
    await assertAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        customer_email,
        user_id,
        status,
        currency,
        amount_total_cents,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price_cents,
          created_at
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as unknown as OrderWithItems[], error: null };
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return { data: null, error: e };
    }
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
