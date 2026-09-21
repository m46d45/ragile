"use client";

import { useEffect, useState } from "react";
import type { ProblemRecord, WaDraft } from "@/types";

type Payload = {
  drafts: WaDraft[];
  problems: ProblemRecord[];
};

function headers() {
  const k = typeof window !== "undefined" ? localStorage.getItem("ragile_internal_k") || "" : "";
  return {
    "Content-Type": "application/json",
    ...(k ? { "x-internal-key": k } : {}),
  };
}

export default function AntrianPage() {
  const [data, setData] = useState<Payload>({ drafts: [], problems: [] });
  const [teks, setTeks] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nama, setNama] = useState("");
  const [busy, setBusy] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState("");

  async function muat() {
    const res = await fetch("/api/internal/wa", { headers: headers() });
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    muat();
  }, []);

  async function masukkan(jalur: "ai_draf" | "bahas_tim") {
    setBusy(true);
    setPesan("");
    try {
      const res = await fetch("/api/internal/wa", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ teks, whatsapp, nama, jalur }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPesan(json.error || "Gagal");
        return;
      }
      setTeks("");
      await muat();
      setPesan(
        jalur === "ai_draf"
          ? "Draf AI siap. Cek, edit, lalu setujui. Belum terkirim."
          : "Masuk bahas tim. Belum ada draf untuk dikirim."
      );
    } finally {
      setBusy(false);
    }
  }

  async function aksi(id: string, action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    try {
      const res = await fetch(`/api/internal/wa/${id}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          action,
          draf_final: edits[id],
          catatan_tim: notes[id],
          ...extra,
        }),
      });
      const json = await res.json();
      setPesan(json.note || json.error || "Tersimpan");
      await muat();
    } finally {
      setBusy(false);
    }
  }

  function problemOf(d: WaDraft) {
    return data.problems.find((p) => p.id === d.problem_id);
  }

  return (
    <main className="max-w-5xl mx-auto px-5 pb-12">
      <h1 className="text-2xl font-bold text-primary mb-1">Antrian WhatsApp</h1>
      <p className="text-sm text-gray-600 mb-6">
        Tempel WA masuk. Pilih: asisten AI menyusun draf, atau tim bahas dulu.
        Kirim ke klien hanya setelah Anda setuju — salin manual.
      </p>

      <section className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
        <label className="block text-sm font-medium">Teks WA masuk</label>
        <textarea
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Pak, di proyek renovasi kemarin plesteran dinding sering diulang karena tidak rata, hampir tiap sore ketahuan…"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama (identitas, tidak ikut ekspor riset)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Nomor WA (tidak ikut ekspor riset)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => masukkan("ai_draf")}
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Minta draf AI
          </button>
          <button
            disabled={busy}
            onClick={() => masukkan("bahas_tim")}
            className="border border-primary text-primary px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Bahas tim dulu
          </button>
        </div>
      </section>

      {pesan && <p className="text-sm text-primary mb-4">{pesan}</p>}

      <div className="space-y-4">
        {data.drafts.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada antrian.</p>
        )}
        {data.drafts.map((d) => {
          const p = problemOf(d);
          return (
            <article key={d.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{d.status}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{d.jalur}</span>
                {p && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {p.tingkat} · {p.jenis_macet}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">Masuk</p>
              <p className="text-sm mb-3 whitespace-pre-wrap">{d.teks_masuk}</p>
              <p className="text-xs text-gray-500 mb-1">Draf (boleh diedit)</p>
              <textarea
                value={edits[d.id] ?? d.draf_final ?? d.draf_ai ?? ""}
                onChange={(e) => setEdits((s) => ({ ...s, [d.id]: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              />
              <textarea
                value={notes[d.id] ?? d.catatan_tim ?? ""}
                onChange={(e) => setNotes((s) => ({ ...s, [d.id]: e.target.value }))}
                rows={2}
                placeholder="Catatan tim"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={busy}
                  onClick={() => aksi(d.id, "simpan")}
                  className="border px-3 py-1.5 rounded-lg text-sm"
                >
                  Simpan edit
                </button>
                <button
                  disabled={busy}
                  onClick={() => aksi(d.id, "setujui")}
                  className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm"
                >
                  Setujui (belum kirim)
                </button>
                <button
                  disabled={busy}
                  onClick={() => aksi(d.id, "terkirim")}
                  className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm"
                >
                  Sudah disalin ke WA
                </button>
                <button
                  disabled={busy}
                  onClick={() => aksi(d.id, "bahas")}
                  className="border border-primary text-primary px-3 py-1.5 rounded-lg text-sm"
                >
                  Tahan — bahas tim
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    aksi(d.id, "kajian", {
                      pola_berulang: true,
                      lintas_lokasi: true,
                    })
                  }
                  className="border px-3 py-1.5 rounded-lg text-sm"
                >
                  Naikkan ke kajian
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
