"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { JenisHambatan, SaatKetahuan, SeringHambatan } from "@/types";

type Hasil = {
  yang_kebaca: string;
  cerita_aman: string;
  aksi: { nomor: number; slug: string; judul: string; isi: string; href: string }[];
  tautan: { href: string; label: string }[];
  lampiran_skor: "terlihat" | "belum_terlihat";
};

const JENIS: { value: JenisHambatan; label: string }[] = [
  { value: "nunggu_orang", label: "Nunggu orang" },
  { value: "nunggu_alat", label: "Nunggu alat" },
  { value: "ulang_kerja", label: "Kerja harus diulang" },
  { value: "info_salah_terlambat", label: "Info salah / terlambat" },
  { value: "nunggu_serah_terima", label: "Nunggu serah terima" },
  { value: "lain", label: "Lain / belum jelas" },
];

const SERING: { value: SeringHambatan; label: string }[] = [
  { value: "sering", label: "Sering" },
  { value: "sekali_sekali", label: "Sekali-sekali" },
  { value: "belum_jelas", label: "Belum jelas" },
];

const SAAT: { value: SaatKetahuan; label: string }[] = [
  { value: "pagi", label: "Pagi" },
  { value: "tengah_hari", label: "Tengah hari" },
  { value: "menjelang_selesai", label: "Menjelang selesai" },
  { value: "belum_jelas", label: "Belum jelas" },
];

export default function DiagnosaPage() {
  const [step, setStep] = useState(0);
  const [jenis, setJenis] = useState<JenisHambatan | "">("");
  const [sering, setSering] = useState<SeringHambatan | "">("");
  const [saat, setSaat] = useState<SaatKetahuan | "">("");
  const [cerita, setCerita] = useState("");
  const [lampiran, setLampiran] = useState(false);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function selesai() {
    if (!jenis) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/diagnosa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jenis,
          sering: sering || "belum_jelas",
          saat: saat || "belum_jelas",
          cerita,
          lampiran,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyusun hasil.");
        return;
      }
      setHasil(data.hasil);
    } finally {
      setBusy(false);
    }
  }

  function pilih<T extends string>(value: T, setter: (v: T) => void, next: number) {
    setter(value);
    setStep(next);
  }

  if (hasil) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader current="/diagnosa" />
        <main className="max-w-2xl mx-auto px-5 py-10 space-y-4">
          <h1 className="text-2xl font-bold text-primary mb-2">Yang kebaca dari cerita Anda</h1>

          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-primary mb-2">Yang kebaca…</h2>
            <p className="text-sm text-gray-800 leading-relaxed">{hasil.yang_kebaca}</p>
          </article>

          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-primary mb-2">
              Cerita tidak diteruskan
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed">{hasil.cerita_aman}</p>
          </article>

          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">
              Yang bisa dicoba minggu ini
            </h2>
            {hasil.aksi.length === 0 ? (
              <p className="text-sm text-gray-600">
                Belum ada yang pas dari kebiasaan minggu ini. Cerita lebih panjang lewat
                WhatsApp — tidak dibalas otomatis.
              </p>
            ) : (
              <ol className="space-y-3">
                {hasil.aksi.map((a) => (
                  <li key={a.slug} className="text-sm">
                    <Link href={a.href} className="font-semibold text-accent hover:underline">
                      {a.judul}
                    </Link>
                    <p className="text-gray-700 mt-1">{a.isi}</p>
                  </li>
                ))}
              </ol>
            )}
          </article>

          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">Tautan</h2>
            <ul className="space-y-2 text-sm">
              {hasil.tautan.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-accent font-semibold hover:underline">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <p className="text-sm text-gray-600 px-1">
            Lampiran skor:{" "}
            <span className="font-medium text-primary">
              {hasil.lampiran_skor === "terlihat" ? "terlihat" : "belum terlihat"}
            </span>
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                setHasil(null);
                setStep(0);
                setJenis("");
                setSering("");
                setSaat("");
                setCerita("");
                setLampiran(false);
              }}
              className="text-sm text-gray-600 underline"
            >
              Cerita lagi
            </button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader current="/diagnosa" />
      <main className="max-w-2xl mx-auto px-5 py-10">
        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">
          Cek singkat · tanpa daftar
        </p>
        <h1 className="text-xl font-bold text-primary mb-2">
          Minggu ini yang bikin kerja berhenti apa?
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Nunggu orang/alat, atau kerja harus diulang? Cerita saja dulu, tidak
          apa-apa.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {step === 0 && (
            <>
              <h2 className="font-semibold text-primary mb-4">Pilih yang paling terasa</h2>
              <div className="space-y-3">
                {JENIS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => pilih(opt.value, setJenis, 1)}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-semibold text-primary mb-4">Ini sering, atau sekali-sekali?</h2>
              <div className="space-y-3">
                {SERING.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => pilih(opt.value, setSering, 2)}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-semibold text-primary mb-4">Kapan biasanya ketahuan?</h2>
              <div className="space-y-3">
                {SAAT.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => pilih(opt.value, setSaat, 3)}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-semibold text-primary mb-2">Cerita singkat (boleh kosong)</h2>
              <p className="text-xs text-gray-500 mb-3">
                Contoh: pagi nunggu mixer, atau plesteran diulang hampir tiap sore.
              </p>
              <textarea
                value={cerita}
                onChange={(e) => setCerita(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm mb-4"
                placeholder="Cerita lapangan…"
              />
              <label className="flex items-center gap-2 text-sm mb-5">
                <input
                  type="checkbox"
                  checked={lampiran}
                  onChange={(e) => setLampiran(e.target.checked)}
                />
                Ada foto atau catatan yang mau dilampirkan
              </label>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <button
                disabled={busy}
                onClick={selesai}
                className="w-full bg-accent text-white py-2.5 rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? "Menyusun…" : "Lihat yang kebaca"}
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-4">{step + 1} / 4</p>
      </main>
      <SiteFooter />
    </div>
  );
}
