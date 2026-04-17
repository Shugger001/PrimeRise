"use client";

import { getAppRoleForUser, type AppRole } from "@/lib/auth/user-role";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

function avatarInitial(email: string | undefined) {
  const first = (email ?? "").trim().charAt(0);
  return first ? first.toUpperCase() : "U";
}

export function AuthNav() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [appRole, setAppRole] = useState<AppRole | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!cancelled) setUser(u ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setAppRole(null);
      return;
    }
    const supabase = createClient();
    let cancelled = false;
    getAppRoleForUser(supabase, user.id).then((role) => {
      if (!cancelled) setAppRole(role);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user === undefined || (user && appRole === undefined)) {
    return <span className="nav__link opacity-60">…</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="nav__link">
        Sign in
      </Link>
    );
  }

  if (appRole === "admin") {
    return (
      <Link href="/admin/dashboard" className="nav__link">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-forest)] text-xs font-bold text-white">
            {avatarInitial(user.email)}
          </span>
          Admin
        </span>
      </Link>
    );
  }

  return (
    <Link href="/account" className="nav__link">
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-forest)] text-xs font-bold text-white">
          {avatarInitial(user.email)}
        </span>
        Account
      </span>
    </Link>
  );
}
