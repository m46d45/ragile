import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader({ current }: { current?: string }) {
  const item = (href: string, label: string) => (
    <Link
      href={href}
      className={`hover:text-primary ${current === href ? "text-primary font-semibold" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        <BrandMark size="sm" />
        <nav className="flex items-center gap-3 sm:gap-5 text-sm text-gray-600">
          {item("/faq", "FAQ")}
          {item("/tanya", "Tanya")}
          {item("/diagnosa", "Diagnosa")}
        </nav>
      </div>
    </header>
  );
}
