import { createClient } from "@/lib/supabase/server";
import type { ContentRow } from "@/lib/types/database";

export async function getContentEntries(): Promise<{ data: ContentRow[] | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("content").select("*").order("key");
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ContentRow[], error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function upsertContent(
  key: string,
  value: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("content").upsert({ key, value }, { onConflict: "key" });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
