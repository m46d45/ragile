import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { actionItems, findActionBySlug } from "@/lib/clinic";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return actionItems.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const aksi = findActionBySlug(params.slug);
  if (!aksi) return { title: "Yang bisa dicoba — RagilE" };
  return {
    title: `${aksi.judul} — RagilE`,
    description: aksi.isi_mandor,
  };
}

export default function AksiPage({ params }: Props) {
  const aksi = findActionBySlug(params.slug);
  if (!aksi) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-5 py-10">
        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">
          Yang bisa dicoba minggu ini
        </p>
        <h1 className="text-2xl font-bold text-primary mb-4">{aksi.judul}</h1>
        <p className="text-sm text-gray-800 leading-relaxed mb-8">{aksi.isi_mandor}</p>
        <p className="text-sm text-gray-600 mb-8">
          Cerita Anda tidak kami teruskan ke orang lain. Ini kebiasaan kecil,
          bukan jaminan.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/diagnosa"
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Cerita dulu
          </Link>
          <Link href="/faq" className="border px-4 py-2 rounded-lg text-sm">
            Yang sering ditanya
          </Link>
        </div>
        <ul className="mt-10 space-y-2 text-sm">
          {actionItems
            .filter((a) => a.slug !== aksi.slug)
            .map((a) => (
              <li key={a.slug}>
                <Link href={`/aksi/${a.slug}`} className="text-accent hover:underline">
                  {a.judul}
                </Link>
              </li>
            ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
