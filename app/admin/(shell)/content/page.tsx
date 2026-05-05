import { getContentEntries } from "@/lib/services/content";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default async function AdminContentPage() {
  const { data: entries, error } = await getContentEntries();

  return (
    <div className="space-y-6 max-[375px]:space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--color-bg-deep)] max-[375px]:text-xl">Content</h1>
        <p className="mt-1 text-sm text-admin-muted max-[375px]:text-xs">
          Key/value copy for future site integration (hero text, etc.)
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error.message}
        </div>
      )}
      <ContentEditor initialEntries={entries ?? []} />
    </div>
  );
}
