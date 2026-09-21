"use client";

import { useEffect, useState } from "react";
import type { ProblemRisetRow } from "@/types";

export default function RisetPage() {
  const [rows, setRows] = useState<ProblemRisetRow[]>([]);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    const k = localStorage.getItem("ragile_internal_k") || "";
    fetch("/api/internal/riset", {
      headers: k ? { "x-internal-key": k } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        setRows(d.rows || []);
        setCatatan(d.catatan || "");
      });
  }, []);

  function unduh() {
    const blob = new Blob([JSON.stringify({ catatan, rows }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ragile-problem-bank-riset.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-5xl mx-auto px-5 pb-12">
      <h1 className="text-2xl font-bold text-primary mb-1">Ekspor riset</h1>
      <p className="text-sm text-gray-600 mb-4">
        {catatan ||
          "Hanya baris yang izin anonimnya ya. Identitas dan cerita mentah tidak ikut."}
      </p>
      <button
        onClick={unduh}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold mb-6"
      >
        Unduh JSON
      </button>
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Sumber</th>
              <th className="p-2">Jenis</th>
              <th className="p-2">Sering</th>
              <th className="p-2">Saat</th>
              <th className="p-2">Tingkat</th>
              <th className="p-2">Alur</th>
              <th className="p-2">Ringkasan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{r.created_at.slice(0, 10)}</td>
                <td className="p-2">{r.sumber_masuk}</td>
                <td className="p-2">{r.jenis_hambatan}</td>
                <td className="p-2">{r.sering}</td>
                <td className="p-2">{r.saat_ketahuan}</td>
                <td className="p-2">{r.tingkat}</td>
                <td className="p-2">{r.status_alur}</td>
                <td className="p-2">{r.ringkasan_lapangan}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={8}>
                  Belum ada baris berizin. Izin ditanya setelah dibantu, di bot
                  atau nanti di WA.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
