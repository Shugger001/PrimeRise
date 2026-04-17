import { SiteChrome } from "@/components/marketing/SiteChrome";
import "../marketing.css";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome activeNav="default">
      <div className="min-h-[60vh] bg-[#f7f4ec]">{children}</div>
    </SiteChrome>
  );
}
