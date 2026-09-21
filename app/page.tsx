import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { actionItems } from "@/lib/clinic";

export default function HomePage() {
  const aksi = actionItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader current="/" />

      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Kalau di lokasi sering nunggu orang atau alat, atau kerja harus
                dikerjakan ulang
              </h1>
              <p className="text-lg opacity-90 mb-8">
                Cerita saja di sini. Nanti dibantu cari yang bisa dicoba minggu
                ini.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/diagnosa"
                  className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover"
                >
                  Cerita singkat
                </Link>
                <Link
                  href="/faq"
                  className="bg-white text-primary px-6 py-3 rounded-lg font-semibold"
                >
                  Yang sering ditanya
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero.jpg"
                alt="Orang di lokasi nunggu kerja mulai"
                width={1280}
                height={720}
                className="w-full h-64 md:h-80 object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Yang sering terjadi di lapangan
          </h2>
          <p className="text-gray-600 text-center max-w-lg mx-auto mb-10">
            Bukan software. Bukan daftar member. Cukup cerita: nunggu, atau
            kerja diulang.
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
              <Image
                src="/images/manfaat.jpg"
                alt="Pos lokasi kontraktor kecil"
                width={1280}
                height={720}
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 order-1 md:order-2">
              {[
                {
                  title: "Nunggu orang",
                  desc: "Pagi sudah di lokasi, orang yang ditunggu belum datang. Kerja diam.",
                },
                {
                  title: "Nunggu alat",
                  desc: "Mixer, scaffolding, atau alat lain belum ada. Orang sudah siap.",
                },
                {
                  title: "Kerja diulang",
                  desc: "Sudah dikerjakan, harus dikerjakan lagi. Sering ketahuan terlambat.",
                },
                {
                  title: "Cerita tidak diteruskan",
                  desc: "Cerita Anda tidak kami teruskan ke orang lain.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-primary mb-1 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Cara cerita di sini
          </h2>
          <p className="text-gray-600 text-center max-w-lg mx-auto mb-10">
            Pendek saja. Tidak perlu daftar.
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Cerita",
                  desc: "Nunggu orang/alat, atau kerja harus diulang. Boleh tulis pagi, sering, atau sekali saja.",
                },
                {
                  step: "2",
                  title: "Yang kebaca",
                  desc: "Kami tuliskan ulang apa yang kebaca — bukan laporan ke siapa pun.",
                },
                {
                  step: "3",
                  title: "Yang bisa dicoba minggu ini",
                  desc: "Paling banyak tiga. Dari kebiasaan kecil di lokasi, bukan sistem besar.",
                },
                {
                  step: "4",
                  title: "Tautan",
                  desc: "Buka yang relevan. Kalau ceritanya panjang, WhatsApp — tidak dibalas otomatis.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 pl-12 relative"
                >
                  <div className="absolute top-4 left-4 bg-accent text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/cara-kerja.jpg"
                alt="Kerja di lokasi yang harus dicek ulang"
                width={1280}
                height={720}
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" id="aksi">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Yang bisa dicoba
          </h2>
          <p className="text-gray-600 text-center max-w-lg mx-auto mb-10">
            Muncul setelah cerita yang cocok. Tidak semua sekaligus.
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/fitur.jpg"
                alt="Catatan berangkat di lokasi"
                width={1280}
                height={720}
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="space-y-3">
              {aksi.map((item) => (
                <Link
                  key={item.slug}
                  href={`/aksi/${item.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 hover:border-primary"
                >
                  <div className="text-sm font-bold text-accent flex-shrink-0 w-6">
                    {item.nomor}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm">
                      {item.judul}
                    </h3>
                    <p className="text-xs text-gray-600">{item.isi_mandor}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary-light p-10 text-white flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3">
                Minggu ini yang bikin kerja berhenti apa?
              </h2>
              <p className="opacity-90 mb-6">
                Nunggu orang/alat, atau kerja harus diulang? Cerita saja dulu,
                tidak apa-apa.
              </p>
              <div>
                <Link
                  href="/diagnosa"
                  className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover"
                >
                  Cerita sekarang
                </Link>
              </div>
            </div>
            <div>
              <Image
                src="/images/metode.jpg"
                alt="Lokasi kecil: orang dan alat belum lengkap"
                width={1280}
                height={720}
                className="w-full h-full min-h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
