import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <span className="text-xs uppercase tracking-wide text-gray-500">
              Internal
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link href="/internal/antrian" className="hover:text-primary">
              Antrian WA
            </Link>
            <Link href="/internal/faq" className="hover:text-primary">
              FAQ
            </Link>
            <Link href="/internal/kajian" className="hover:text-primary">
              Kajian
            </Link>
            <Link href="/internal/riset" className="hover:text-primary">
              Ekspor riset
            </Link>
          </nav>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-5 py-3">
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          WhatsApp tidak dikirim otomatis. Draf AI atau bahas tim dulu, baru
          disalin setelah Anda setuju.
        </p>
      </div>
      {children}
    </div>
  );
}
