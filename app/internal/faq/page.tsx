"use client";

import { useEffect, useState } from "react";
import type { FaqItem, FaqUsulan } from "@/types";

function headers() {
  const k = typeof window !== "undefined" ? localStorage.getItem("ragile_internal_k") || "" : "";
  return {
    "Content-Type": "application/json",
    ...(k ? { "x-internal-key": k } : {}),
  };
}

export default function InternalFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [usulan, setUsulan] = useState<FaqUsulan[]>([]);
  const [pesan, setPesan] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { q: string; a: string }>>({});
  const [gabung, setGabung] = useState<Record<string, string>>({});
  const [manualQ, setManualQ] = useState("");
  const [manualA, setManualA] = useState("");

  async function muat() {
    const res = await fetch("/api/internal/faq", { headers: headers() });
    if (!res.ok) return;
    const data = await res.json();
    setFaqs(data.faqs || []);
    setUsulan(data.usulan || []);
  }

  useEffect(() => {
    muat();
  }, []);

  async function aksi(body: Record<string, unknown>) {
    const res = await fetch("/api/internal/faq", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setPesan(data.error || "Tersimpan");
    await muat();
  }

  const calon = usulan.filter((u) => u.status === "calon" || u.status === "ditinjau");
  const arsip = usulan.filter((u) => u.status !== "calon" && u.status !== "ditinjau");

  return (
    <main className="max-w-5xl mx-auto px-5 pb-12">
      <h1 className="text-2xl font-bold text-primary mb-1">Bank pertanyaan</h1>
      <p className="text-sm text-gray-600 mb-6">
        FAQ awal hanya benih. Pertanyaan baru dari bot atau WA yang belum pas
        masuk calon. Tidak langsung terbit — ditinjau dulu, boleh dijadikan
        FAQ, digabung, atau ditolak. Yang sering muncul naik duluan.
      </p>
      {pesan && <p className="text-sm text-primary mb-4">{pesan}</p>}

      <section className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
        <h2 className="font-semibold text-primary">Tambah manual</h2>
        <input
          value={manualQ}
          onChange={(e) => setManualQ(e.target.value)}
          placeholder="Pertanyaan (bahasa lapangan)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <textarea
          value={manualA}
          onChange={(e) => setManualA(e.target.value)}
          rows={3}
          placeholder="Jawaban singkat. Bukan audit, bukan sertifikat."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={() => {
            aksi({ action: "manual", pertanyaan: manualQ, jawaban: manualA });
            setManualQ("");
            setManualA("");
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Terbitkan
        </button>
      </section>

      <h2 className="font-semibold text-primary mb-3">
        Calon ({calon.length}) — belum terbit
      </h2>
      <div className="space-y-4 mb-10">
        {calon.length === 0 && (
          <p className="text-sm text-gray-500">Belum ada calon. Tanya yang belum ketemu akan masuk ke sini.</p>
        )}
        {calon.map((u) => {
          const d = drafts[u.id] || { q: u.pertanyaan_mentah, a: "" };
          return (
            <article key={u.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex flex-wrap gap-2 text-xs mb-2">
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">{u.status}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{u.sumber}</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                  muncul {u.kali_muncul}×
                </span>
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{u.pertanyaan_mentah}</p>
              <input
                value={d.q}
                onChange={(e) => setDrafts((s) => ({ ...s, [u.id]: { ...d, q: e.target.value } }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
              />
              <textarea
                value={d.a}
                onChange={(e) => setDrafts((s) => ({ ...s, [u.id]: { ...d, a: e.target.value } }))}
                rows={3}
                placeholder="Tulis jawaban publik sebelum menerbitkan"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() =>
                    aksi({
                      action: "jadikan",
                      usulan_id: u.id,
                      pertanyaan: d.q,
                      jawaban: d.a,
                    })
                  }
                  className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm"
                >
                  Jadikan FAQ
                </button>
                <select
                  value={gabung[u.id] || ""}
                  onChange={(e) => setGabung((s) => ({ ...s, [u.id]: e.target.value }))}
                  className="border border-gray-300 rounded-lg text-sm px-2 py-1.5"
                >
                  <option value="">Gabung ke FAQ existing…</option>
                  {faqs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.pertanyaan}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    gabung[u.id] && aksi({ action: "gabung", usulan_id: u.id, faq_id: gabung[u.id] })
                  }
                  className="border px-3 py-1.5 rounded-lg text-sm"
                >
                  Gabung
                </button>
                <button
                  onClick={() => aksi({ action: "tolak", usulan_id: u.id })}
                  className="border px-3 py-1.5 rounded-lg text-sm"
                >
                  Tolak
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <h2 className="font-semibold text-primary mb-3">Terbit ({faqs.filter((f) => f.is_published).length})</h2>
      <div className="space-y-3 mb-10">
        {faqs.map((f) => (
          <article key={f.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap gap-2 text-xs mb-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded">{f.asal}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                {f.is_published ? "terbit" : "disembunyikan"}
              </span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                dipakai {f.kali_dipakai}×
              </span>
            </div>
            <p className="font-medium text-sm text-primary">{f.pertanyaan}</p>
            <p className="text-sm text-gray-700 mt-1">{f.jawaban}</p>
            {f.locked ? (
              <p className="mt-3 text-xs text-gray-500">Terkunci F0 — tidak diubah dari sini.</p>
            ) : (
              <button
                onClick={() =>
                  aksi({ action: "simpan", id: f.id, is_published: !f.is_published })
                }
                className="mt-3 border px-3 py-1.5 rounded-lg text-xs"
              >
                {f.is_published ? "Sembunyikan dari publik" : "Terbitkan lagi"}
              </button>
            )}
          </article>
        ))}
      </div>

      {arsip.length > 0 && (
        <>
          <h2 className="font-semibold text-primary mb-3">Arsip usulan</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            {arsip.map((u) => (
              <li key={u.id}>
                {u.status} · {u.kali_muncul}× · {u.pertanyaan_mentah.slice(0, 80)}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
