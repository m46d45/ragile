import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { NON_KLAIM } from "@/lib/clinic";
import { listPublishedFaqs } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yang sering ditanya — RagilE",
  description:
    "Pertanyaan singkat yang sudah ada jawabannya. Daftar ini bertambah setelah ditinjau.",
};

export default async function FaqPage() {
  const items = await listPublishedFaqs();

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader current="/faq" />
      <main className="max-w-2xl mx-auto px-5 py-10">
        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">
          Umum · tanpa login
        </p>
        <h1 className="text-2xl font-bold text-primary mb-2">Yang sering ditanya</h1>
        <p className="text-sm text-gray-600 mb-8">
          Daftar awal, akan bertambah kalau banyak yang bertanya hal yang sama.
          {` ${NON_KLAIM} `}
          Belum ada di sini? Tanya singkat atau cerita lewat WhatsApp.
        </p>
        <div className="space-y-4">
          {items.map((item) => (
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
          Belum ketemu?{" "}
          <Link href="/tanya" className="text-accent font-semibold">
            Tanya singkat
          </Link>
          . Kalau ceritanya panjang, lebih baik WhatsApp.
        </p>
      </main>
    </div>
  );
}
