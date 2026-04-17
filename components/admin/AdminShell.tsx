import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/content", label: "Content" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-admin-bg font-body text-admin-ink">
      <aside className="hidden w-56 shrink-0 border-r border-admin-border bg-admin-surfaceMuted md:flex md:flex-col">
        <div className="border-b border-admin-border px-4 py-5">
          <Link
            href="/admin/dashboard"
            className="font-serif text-lg font-semibold tracking-tight text-[var(--color-bg-deep)]"
          >
            Prime Rise
          </Link>
          <p className="mt-1 text-xs text-admin-muted">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-sans text-neutral-700 transition hover:bg-[rgba(79,92,56,0.08)] hover:text-[var(--color-bg-deep)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-admin-border p-3">
          <Link
            href="/"
            className="mb-2 block rounded-lg px-3 py-2 text-sm text-admin-muted hover:text-[var(--color-bg-deep)]"
          >
            ← View site
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-admin-border bg-admin-surface/95 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-serif font-medium text-[var(--color-bg-deep)]">
            Admin
          </span>
          <AdminLogoutButton />
        </header>
        <nav className="border-b border-admin-border bg-admin-surface px-2 py-2 md:hidden" aria-label="Admin sections">
          <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-10 whitespace-nowrap rounded-xl border border-admin-border bg-white px-3 py-2 text-sm font-medium text-admin-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="min-h-10 whitespace-nowrap rounded-xl border border-admin-border bg-admin-surfaceMuted px-3 py-2 text-sm font-medium text-admin-muted"
            >
              View site
            </Link>
          </div>
        </nav>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
