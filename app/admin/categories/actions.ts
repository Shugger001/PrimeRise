"use server";

import { assertAdmin } from "@/lib/auth/admin";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/services/categories-mutations";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const nameSchema = z.string().min(1, "Name is required").max(120);

export async function createCategoryAction(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { ok: false as const, message: parsed.error.flatten().formErrors.join(", ") };
  const { error } = await createCategory(parsed.data);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { ok: false as const, message: parsed.error.flatten().formErrors.join(", ") };
  const { error } = await updateCategory(id, parsed.data);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function deleteCategoryAction(id: string) {
  await assertAdmin();
  const { error } = await deleteCategory(id);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/categories");
  return { ok: true as const };
}
