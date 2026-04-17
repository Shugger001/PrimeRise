"use server";

import { assertAdmin } from "@/lib/auth/admin";
import {
  deleteCustomerReview,
  updateCustomerReviewStatus,
} from "@/lib/services/reviews";
import type { ReviewStatus } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function setReviewStatusAction(id: string, status: ReviewStatus) {
  await assertAdmin();
  if (!id) return { ok: false as const, message: "Missing review id" };
  if (!["pending", "approved", "rejected"].includes(status)) {
    return { ok: false as const, message: "Invalid review status" };
  }
  const { error } = await updateCustomerReviewStatus(id, status);
  if (error) return { ok: false as const, message: error.message };
  revalidateReviews();
  return { ok: true as const };
}

export async function deleteReviewAction(id: string) {
  await assertAdmin();
  if (!id) return { ok: false as const, message: "Missing review id" };
  const { error } = await deleteCustomerReview(id);
  if (error) return { ok: false as const, message: error.message };
  revalidateReviews();
  return { ok: true as const };
}
