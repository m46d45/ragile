"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

type ChatItem = { role: "user" | "assistant"; text: string };

function sessionId() {
  if (typeof window === "undefined") return "";
  const key = "ragile_bot_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function TanyaPage() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [izinDone, setIzinDone] = useState(false);
  const [escalate, setEscalate] = useState(false);
  const [via, setVia] = useState<string | null>(null);
  const [faqKind, setFaqKind] = useState<"terjawab" | "calon" | null>(null);

  useEffect(() => {
    sessionId();
  }, []);

  async function kirim() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setItems((prev) => [...prev, { role: "user", text: trimmed }]);
    setText("");
    setLoading(true);
    setIzinDone(false);
    try {
      const res = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, sessionId: sessionId() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setItems((prev) => [
          ...prev,
          { role: "assistant", text: data.error || "Gagal menjawab." },
        ]);
        return;
      }
      setItems((prev) => [...prev, { role: "assistant", text: data.reply }]);
      setProblemId(data.problemId || null);
      setEscalate(Boolean(data.escalateToWa));
      setVia(data.via);
      setFaqKind(data.faq?.kind || null);
    } finally {
      setLoading(false);
    }
  }

  async function jawabIzin(izin: "ya" | "tidak") {
    if (!problemId) return;
    await fetch("/api/problems/izin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: problemId, izin }),
    });
    setIzinDone(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader current="/tanya" />
      <main className="max-w-2xl mx-auto px-5 py-8 flex-1 w-full">
        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">
          Bot minimal
        </p>
        <h1 className="text-2xl font-bold text-primary mb-2">Tanya singkat</h1>
        <p className="text-sm text-gray-600 mb-6">
          AI menjawab dari FAQ dan tip lapangan. Bukan audit, bukan sertifikat,
          bukan janji hemat biaya. Cerita dalam lewat WhatsApp — draf dulu,
          baru dikirim setelah disetujui, atau dibahas tim.
        </p>

        <div className="space-y-3 mb-6">
          {items.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
              Contoh: “Tukang sering nunggu mixer sampai siang” atau “Plesteran
              sering diulang karena tidak rata”.
            </div>
          )}
          {items.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 text-sm whitespace-pre-wrap ${
                item.role === "user"
                  ? "bg-primary text-white ml-8"
                  : "bg-white border border-gray-200 mr-4"
              }`}
            >
              {item.text}
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-500">Menyusun jawaban…</div>
          )}
        </div>

        {via && (
          <p className="text-xs text-gray-500 mb-3">
            Sumber jawaban: {via === "ai" ? "asisten AI" : "FAQ / tip (AI belum tersambung)"}
          </p>
        )}

        {faqKind === "calon" && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            Pertanyaan ini belum ada di daftar yang sering ditanya. Kami simpan
            untuk ditinjau. Kalau banyak yang tanya hal yang sama, nanti masuk
            daftar.
          </div>
        )}

        {escalate && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 mb-4">
            Ini lebih cocok dibahas via WhatsApp. Tidak dibalas otomatis.
            Asisten AI atau tim menyusun draf, lalu disetujui dulu.
          </div>
        )}

        {problemId && !izinDone && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm mb-4">
            <p className="mb-3">
              Boleh kami simpan cerita ini tanpa nama, supaya bantuan berikutnya
              lebih membumi? Mudah ditolak. Tetap dibantu kalau tidak.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => jawabIzin("ya")}
                className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm"
              >
                Boleh, tanpa nama
              </button>
              <button
                onClick={() => jawabIzin("tidak")}
                className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
              >
                Jangan
              </button>
            </div>
          </div>
        )}
        {izinDone && (
          <p className="text-xs text-gray-500 mb-4">Pilihan izin tersimpan.</p>
        )}

        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Cerita singkat cara kerja di lapangan…"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <button
            onClick={kirim}
            disabled={loading}
            className="self-end bg-accent text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-accent-hover disabled:opacity-60"
          >
            Kirim
          </button>
        </div>
      </main>
    </div>
  );
}
