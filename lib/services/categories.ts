import { createClient } from "@/lib/supabase/server";
import type { CategoryRow } from "@/lib/types/database";

export async function getCategories(): Promise<{ data: CategoryRow[] | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as CategoryRow[], error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
