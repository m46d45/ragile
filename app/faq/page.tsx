import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { faqItems, NON_KLAIM } from "@/lib/clinic";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — RagilE (Ragil Elektronic)",
  description:
    "Pertanyaan singkat tentang klinik cara kerja lapangan RagilE. Bukan audit, bukan sertifikat.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader current="/faq" />
      <main className="max-w-2xl mx-auto px-5 py-10">
        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">
          Umum · tanpa login
        </p>
        <h1 className="text-2xl font-bold text-primary mb-2">FAQ</h1>
        <p className="text-sm text-gray-600 mb-8">
          Belajar sendiri dulu. {NON_KLAIM} Curhat lebih dalam lewat WhatsApp —
          tidak dibalas otomatis.
        </p>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <article
              key={item.id}
              id={item.slug}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <h2 className="font-semibold text-primary mb-2">{item.pertanyaan}</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{item.jawaban}</p>
            </article>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-8">
          Pertanyaan belum ada di sini?{" "}
          <Link href="/tanya" className="text-accent font-semibold">
            Tanya bot singkat
          </Link>
          . Kalau ceritanya panjang, lebih baik WhatsApp.
        </p>
      </main>
    </div>
  );
}
