"use server";

import { assertAdmin } from "@/lib/auth/admin";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/services/products";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(8000).optional().nullable(),
  ingredients: z.string().max(4000).optional().nullable(),
  highlights: z.string().max(4000).optional().nullable(),
  serving_size: z.string().max(120).optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  image_url: z
    .string()
    .max(2048)
    .optional()
    .nullable()
    .refine(
      (s) => s == null || s === "" || /^https?:\/\//i.test(s) || s.startsWith("/"),
      { message: "Image must be a URL or a path starting with /" }
    ),
  category: z.string().max(120).optional().nullable(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
});

export async function createProductAction(formData: FormData) {
  await assertAdmin();
  const raw = {
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : null,
    ingredients: formData.get("ingredients") ? String(formData.get("ingredients")) : null,
    highlights: formData.get("highlights") ? String(formData.get("highlights")) : null,
    serving_size: formData.get("serving_size") ? String(formData.get("serving_size")) : null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    image_url: formData.get("image_url") ? String(formData.get("image_url")) : null,
    category: formData.get("category") ? String(formData.get("category")) : null,
    stock: formData.get("stock") !== "" ? Number(formData.get("stock")) : 0,
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const input: ProductInput = {
    ...parsed.data,
    image_url: parsed.data.image_url || null,
  };
  const { error } = await createProduct(input);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

export async function updateProductAction(id: string, formData: FormData) {
  await assertAdmin();
  const raw = {
    name: String(formData.get("name") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : null,
    ingredients: formData.get("ingredients") ? String(formData.get("ingredients")) : null,
    highlights: formData.get("highlights") ? String(formData.get("highlights")) : null,
    serving_size: formData.get("serving_size") ? String(formData.get("serving_size")) : null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    image_url: formData.get("image_url") ? String(formData.get("image_url")) : null,
    category: formData.get("category") ? String(formData.get("category")) : null,
    stock: formData.get("stock") !== "" ? Number(formData.get("stock")) : 0,
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const input: Partial<ProductInput> = {
    ...parsed.data,
    image_url: parsed.data.image_url || null,
  };
  const { error } = await updateProduct(id, input);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

export async function deleteProductAction(id: string) {
  await assertAdmin();
  const { error } = await deleteProduct(id);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
