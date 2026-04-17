"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={loading}
      className="w-full rounded-lg border border-admin-border bg-transparent px-3 py-2 text-left text-sm font-sans text-admin-muted transition hover:bg-[rgba(79,92,56,0.08)] hover:text-[var(--color-bg-deep)] disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
