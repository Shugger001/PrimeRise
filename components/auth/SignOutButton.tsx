"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn btn--ghost border border-neutral-400 text-sm"
      disabled={loading}
      onClick={() => void signOut()}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
