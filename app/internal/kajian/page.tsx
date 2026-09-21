"use client";

import { useEffect, useState } from "react";
import type { ProblemRecord } from "@/types";

function headers() {
  const k = typeof window !== "undefined" ? localStorage.getItem("ragile_internal_k") || "" : "";
  return {
    "Content-Type": "application/json",
    ...(k ? { "x-internal-key": k } : {}),
  };
}

export default function KajianPage() {
  const [items, setItems] = useState<ProblemRecord[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<
    Record<string, { pola: boolean; lokasi: boolean; orang: boolean }>
  >({});
  const [pesan, setPesan] = useState("");

  async function muat() {
    const res = await fetch("/api/internal/kajian", { headers: headers() });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    muat();
  }, []);

  async function simpan(id: string, action: "simpan" | "siap" | "konsultansi") {
    const f = flags[id];
    const res = await fetch("/api/internal/kajian", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        id,
        action,
        catatan_kajian: notes[id],
        pola_berulang: f?.pola,
        lintas_lokasi: f?.lokasi,
        lintas_orang: f?.orang,
      }),
    });
    if (res.ok) {
      setPesan(
        action === "konsultansi"
          ? "Masuk konsultansi setelah kajian."
          : action === "siap"
            ? "Ditandai siap konsultansi."
            : "Catatan kajian tersimpan."
      );
      await muat();
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-5 pb-12">
      <h1 className="text-2xl font-bold text-primary mb-1">Kajian masalah</h1>
      <p className="text-sm text-gray-600 mb-6">
        L2–L3 dan masalah yang dinaikkan. Dikaji dulu agar lebih membumi,
        baru konsultansi. Ke kontraktor cukup: “kami kaji” — jangan sebut
        paper atau sampel.
      </p>
      {pesan && <p className="text-sm text-primary mb-4">{pesan}</p>}
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">
            Belum ada yang masuk kajian. Naikkan dari antrian WA atau lewat bot
            jika polanya menumpuk.
          </p>
        )}
        {items.map((p) => {
          const f = flags[p.id] || {
            pola: p.pola_berulang,
            lokasi: p.lintas_lokasi,
            orang: p.lintas_orang,
          };
          return (
            <article key={p.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex flex-wrap gap-2 text-xs mb-2">
                <span className="bg-primary text-white px-2 py-0.5 rounded">{p.tingkat}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{p.status_alur}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{p.jenis_macet}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{p.sering}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{p.saat_ketahuan}</span>
              </div>
              <p className="text-sm font-medium text-primary mb-1">Yang terbaca</p>
              <p className="text-sm mb-3">{p.ringkasan_lapangan}</p>
              <p className="text-xs text-gray-500 mb-1">Cerita mentah (internal, tidak diekspor)</p>
              <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{p.cerita_mentah}</p>
              <p className="text-xs text-gray-500 mb-1">Catatan kajian</p>
              <textarea
                value={notes[p.id] ?? p.catatan_kajian ?? ""}
                onChange={(e) => setNotes((s) => ({ ...s, [p.id]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              />
              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.pola}
                    onChange={(e) =>
                      setFlags((s) => ({ ...s, [p.id]: { ...f, pola: e.target.checked } }))
                    }
                  />
                  Pola berulang
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.lokasi}
                    onChange={(e) =>
                      setFlags((s) => ({ ...s, [p.id]: { ...f, lokasi: e.target.checked } }))
                    }
                  />
                  Lintas lokasi
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.orang}
                    onChange={(e) =>
                      setFlags((s) => ({ ...s, [p.id]: { ...f, orang: e.target.checked } }))
                    }
                  />
                  Lintas orang
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => simpan(p.id, "simpan")}
                  className="border px-3 py-1.5 rounded-lg text-sm"
                >
                  Simpan kajian
                </button>
                <button
                  onClick={() => simpan(p.id, "siap")}
                  className="border border-primary text-primary px-3 py-1.5 rounded-lg text-sm"
                >
                  Siap konsultansi
                </button>
                <button
                  onClick={() => simpan(p.id, "konsultansi")}
                  className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm"
                >
                  Mulai konsultansi
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
