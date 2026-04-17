import { LoginForm } from "@/components/admin/LoginForm";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-admin-muted font-body">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
