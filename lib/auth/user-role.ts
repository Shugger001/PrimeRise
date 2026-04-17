import type { SupabaseClient } from "@supabase/supabase-js";

/** Application role stored in `public.user_roles` (not Supabase JWT metadata). */
export type AppRole = "admin" | "customer";

/**
 * Loads `public.user_roles.app_role` for the given Supabase user id.
 * Returns null if no row exists (run migration 007) or on error.
 */
export async function getAppRoleForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("app_role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.app_role) return null;
  return data.app_role === "admin" ? "admin" : "customer";
}

export function isAdminAppRole(role: AppRole | null | undefined): boolean {
  return role === "admin";
}
