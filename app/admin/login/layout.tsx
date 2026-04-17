export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4 py-12 font-body">
      {children}
    </div>
  );
}
