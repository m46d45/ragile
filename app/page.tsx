import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Ragile<span className="text-accent">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/diagnosa" className="hover:text-primary">
              Diagnosa
            </Link>
            <Link href="#metode" className="hover:text-primary">
              Metode Kerja
            </Link>
            <Link href="#template" className="hover:text-primary">
              Template
            </Link>
            <Link
              href="#member"
              className="bg-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent-hover"
            >
              Daftar Member
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-white/15 px-4 py-1.5 rounded-full text-sm mb-5">
                Gratis • Untuk Kontraktor Kecil
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Perbaiki Cara Kerja Proyekmu
                <br />
                Lebih Rapi & Efisien
              </h1>
              <p className="text-lg opacity-90 mb-8">
                Ragile adalah klinik digital untuk metode kerja, manajemen
                proyek, dan produksi. Diagnosa cara kerjamu, unduh template siap
                pakai, dan dapatkan rekomendasi praktis — semuanya gratis.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/diagnosa"
                  className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover"
                >
                  Mulai Diagnosa Gratis
                </Link>
                <Link
                  href="#template"
                  className="bg-white text-primary px-6 py-3 rounded-lg font-semibold"
                >
                  Lihat Template
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero.jpg"
                alt="Diskusi denah proyek kontraktor kecil"
                width={800}
                height={500}
                className="w-full h-64 md:h-80 object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Manfaat */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Mengapa Ragile?
          </h2>
          <p className="text-gray-600 text-center max-w-lg mx-auto mb-10">
            Dibuat khusus untuk kontraktor kecil yang ingin cara kerja lebih
            rapi tanpa harus pakai software mahal.
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
              <Image
                src="/images/manfaat.jpg"
                alt="Pos proyek kontraktor kecil"
                width={800}
                height={500}
                className="w-full h-72 object-cover"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 order-1 md:order-2">
              {[
                {
                  icon: "📋",
                  title: "Diagnosa Cepat",
                  desc: "Jawab beberapa pertanyaan, dapatkan rekomendasi metode kerja yang sesuai kondisi lapanganmu.",
                },
                {
                  icon: "📄",
                  title: "Template Siap Pakai",
                  desc: "Checklist mutu, laporan harian, WBS sederhana, dan form lain yang langsung bisa diunduh.",
                },
                {
                  icon: "🤖",
                  title: "AI + Pakar",
                  desc: "Tanya ke AI kapan saja, atau chat dengan pakar yang standby (gratis terbatas).",
                },
                {
                  icon: "📚",
                  title: "Pustaka Metode",
                  desc: "Artikel dan SOP praktis tentang metode kerja, manajemen proyek, dan produksi.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
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

      {/* Cara Kerja */}
      <section className="py-16 bg-white" id="diagnosa">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Cara Kerja Ragile
          </h2>
          <p className="text-gray-600 text-center max-w-lg mx-auto mb-10">
            Empat langkah sederhana untuk mulai memperbaiki cara kerja di
            lapangan.
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Diagnosa",
                  desc: "Isi form singkat tentang cara kerjamu saat ini.",
                },
                {
                  step: "2",
                  title: "Rekomendasi",
                  desc: "Dapatkan hasil diagnosa + saran artikel dan template.",
                },
                {
                  step: "3",
                  title: "Terapkan",
                  desc: "Unduh template, baca metode, atau tanya AI/pakar.",
                },
                {
                  step: "4",
                  title: "Update",
                  desc: "Daftar member untuk menerima update dan kegiatan.",
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
                alt="Rencana kerja dan aktivitas di lapangan"
                width={800}
                height={500}
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="py-16" id="template">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Fitur Utama (Gratis)
          </h2>
          <p className="text-gray-600 text-center max-w-lg mx-auto mb-10">
            Semua fitur di bawah ini tersedia secara gratis di versi 1.0.
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/fitur.jpg"
                alt="Kantor lapangan dan jadwal pekerjaan"
                width={800}
                height={500}
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: "🔍",
                  title: "Diagnosa Cara Kerja",
                  desc: "Form cerdas dengan pertanyaan kasual dan berjenjang. Hasil rekomendasi instan.",
                },
                {
                  icon: "📖",
                  title: "Pustaka Metode Kerja",
                  desc: "Artikel & SOP: metode kerja, manajemen proyek, dan manajemen produksi.",
                },
                {
                  icon: "🛠️",
                  title: "Peralatan & Template",
                  desc: "Checklist QC, laporan harian, WBS, kalkulator produktivitas sederhana.",
                },
                {
                  icon: "💬",
                  title: "Chatbot AI",
                  desc: "Tanya seputar metode kerja dan manajemen proyek kapan saja.",
                },
                {
                  icon: "👥",
                  title: "Daftar Pakar",
                  desc: "Lihat profil ahli. Live chat & jam praktek gratis terbatas.",
                },
                {
                  icon: "📰",
                  title: "Berita & Kegiatan",
                  desc: "Update metode, workshop, dan kegiatan terkait cara kerja konstruksi.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3"
                >
                  <div className="text-xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Diagnosa */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary-light p-10 text-white flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3">
                Siap mengetahui kondisi cara kerjamu?
              </h2>
              <p className="opacity-90 mb-6">
                Diagnosa hanya butuh 2–3 menit. Langsung dapat rekomendasi yang
                sesuai dengan kondisi lapangan.
              </p>
              <div>
                <Link
                  href="/diagnosa"
                  className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover"
                >
                  Mulai Diagnosa Sekarang
                </Link>
              </div>
            </div>
            <div>
              <Image
                src="/images/metode.jpg"
                alt="Pekerjaan renovasi dan metode kerja di lapangan"
                width={800}
                height={500}
                className="w-full h-full min-h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Member Form */}
      <section id="member" className="py-16">
        <div className="max-w-md mx-auto px-5">
          <h2 className="text-2xl font-bold text-primary text-center mb-3">
            Daftar Member Gratis
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm">
            Dapatkan update metode kerja, template baru, dan pengumuman kegiatan
            melalui WhatsApp atau Email.
          </p>
          <form className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                placeholder="Nama lengkap"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="email@contoh.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent text-white py-2.5 rounded-lg font-semibold hover:bg-accent-hover"
            >
              Daftar Sekarang
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-2">Ragile</h4>
              <p className="text-sm opacity-70">
                Klinik digital metode kerja, manajemen proyek, dan produksi
                untuk kontraktor kecil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Fitur</h4>
              <div className="space-y-1 text-sm opacity-70">
                <p>Diagnosa</p>
                <p>Metode Kerja</p>
                <p>Template</p>
                <p>Daftar Pakar</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Lainnya</h4>
              <div className="space-y-1 text-sm opacity-70">
                <p>Berita & Kegiatan</p>
                <p>Daftar Member</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Kontak</h4>
              <p className="text-sm opacity-70">ragile.vercel.app</p>
              <p className="text-sm opacity-70">Versi 1.0 (MVP Free)</p>
            </div>
          </div>
          <div className="border-t border-white/15 pt-5 text-center text-sm opacity-60">
            © 2026 Ragile. Semua hak dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
