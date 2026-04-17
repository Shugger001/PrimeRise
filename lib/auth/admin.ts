import { getAppRoleForUser } from "@/lib/auth/user-role";
import { createClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const role = await getAppRoleForUser(supabase, user.id);
  if (role !== "admin") {
    return null;
  }
  return user;
}

export async function assertAdmin() {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
