"use server";

import { assertAdmin } from "@/lib/auth/admin";
import { upsertContent } from "@/lib/services/content";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const entrySchema = z.object({
  key: z.string().min(1).max(120).regex(/^[a-z0-9._-]+$/i),
  value: z.string().max(20000),
});

export async function upsertContentAction(formData: FormData) {
  await assertAdmin();
  const raw = {
    key: String(formData.get("key") ?? ""),
    value: String(formData.get("value") ?? ""),
  };
  const parsed = entrySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid key or value" };
  }
  const { error } = await upsertContent(parsed.data.key, parsed.data.value);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/admin/content");
  return { ok: true as const };
}
