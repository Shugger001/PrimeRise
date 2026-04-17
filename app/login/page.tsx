import { SignInForm } from "@/components/auth/SignInForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-neutral-600">Loading…</p>}>
      <SignInForm />
    </Suspense>
  );
}
