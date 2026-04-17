import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/types/database";

export async function getProducts(): Promise<{ data: ProductRow[] | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ProductRow[], error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function getProductById(
  id: string
): Promise<{ data: ProductRow | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ProductRow | null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export type ProductInput = {
  name: string;
  description?: string | null;
  ingredients?: string | null;
  highlights?: string | null;
  serving_size?: string | null;
  price?: number | null;
  image_url?: string | null;
  category?: string | null;
  stock?: number | null;
};

export async function createProduct(
  input: ProductInput
): Promise<{ data: ProductRow | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        description: input.description ?? null,
        ingredients: input.ingredients ?? null,
        highlights: input.highlights ?? null,
        serving_size: input.serving_size ?? null,
        price: input.price ?? null,
        image_url: input.image_url ?? null,
        category: input.category ?? null,
        stock: input.stock ?? 0,
      })
      .select("*")
      .single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ProductRow, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<{ data: ProductRow | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").update(input).eq("id", id).select("*").single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ProductRow, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function deleteProduct(id: string): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
