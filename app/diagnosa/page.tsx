"use client";

import { useState } from "react";
import Link from "next/link";

type AnswerMap = Record<string, string>;

const QUESTIONS = [
  {
    id: "jadwal",
    type: "casual",
    question: "Bagaimana cara Anda membuat jadwal pekerjaan saat ini?",
    options: [
      "Masih di kepala / diingat saja",
      "Pakai catatan di HP / WhatsApp",
      "Pakai Excel / kertas",
      "Sudah pakai aplikasi khusus",
    ],
  },
  {
    id: "wbs",
    type: "casual",
    question: "Apakah Anda selalu membuat daftar pekerjaan (WBS) sebelum mulai proyek?",
    options: ["Tidak pernah", "Kadang-kadang", "Hampir selalu"],
  },
  {
    id: "material",
    type: "key",
    question: "Bagaimana cara Anda mengatur material di lapangan?",
    options: [
      "Datang sekaligus di awal",
      "Datang bertahap sesuai kebutuhan",
      "Sering kekurangan / kelebihan material",
    ],
    followUp: {
      "Sering kekurangan / kelebihan material": [
        {
          id: "material_list",
          question: "Apakah Anda membuat daftar kebutuhan material sebelum proyek dimulai?",
          options: ["Tidak", "Kadang-kadang", "Ya, selalu"],
        },
      ],
    },
  },
  {
    id: "produktivitas",
    type: "key",
    question: "Apakah Anda mengukur produktivitas tukang?",
    options: ["Tidak pernah", "Kadang-kadang", "Sudah rutin"],
    followUp: {
      "Tidak pernah": [
        {
          id: "produktivitas_alasan",
          question: "Apa alasan utama Anda belum mengukur produktivitas?",
          options: [
            "Tidak tahu caranya",
            "Sulit menentukan standar",
            "Tidak sempat",
            "Lainnya",
          ],
        },
      ],
    },
  },
  {
    id: "checklist",
    type: "casual",
    question: "Apakah Anda menggunakan daftar periksa (checklist) saat memeriksa hasil pekerjaan?",
    options: ["Tidak pernah", "Kadang-kadang", "Hampir selalu"],
  },
  {
    id: "kendala",
    type: "key",
    question: "Apa kendala terbesar yang sering Anda alami?",
    options: [
      "Jadwal molor",
      "Material tidak tepat waktu",
      "Kualitas hasil kurang stabil",
      "Tukang kurang disiplin",
      "Lainnya",
    ],
  },
];

export default function DiagnosaPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);

  const currentQuestions = [...QUESTIONS, ...followUps];
  const current = currentQuestions[step];

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    // Cek follow-up
    if (current.type === "key" && current.followUp && current.followUp[value]) {
      setFollowUps((prev) => [...prev, ...current.followUp[value]]);
    }

    if (step + 1 >= currentQuestions.length + (current.followUp?.[value]?.length || 0)) {
      // Selesai
      setFinished(true);
    } else {
      setStep(step + 1);
    }
  }

  function getResult() {
    // Logika sederhana untuk hasil diagnosa
    const scoreHints = Object.values(answers);
    let level = "Dasar";
    if (
      scoreHints.includes("Hampir selalu") ||
      scoreHints.includes("Sudah rutin") ||
      scoreHints.includes("Sudah pakai aplikasi khusus")
    ) {
      level = "Menengah";
    }
    if (
      scoreHints.filter((a) =>
        ["Hampir selalu", "Sudah rutin", "Sudah pakai aplikasi khusus"].includes(a)
      ).length >= 3
    ) {
      level = "Baik";
    }
    return level;
  }

  if (finished) {
    const level = getResult();
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-5 h-14 flex items-center">
            <Link href="/" className="text-lg font-bold text-primary">
              Ragile<span className="text-accent">.</span>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-5 py-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Hasil Diagnosa Anda
            </h1>
            <p className="text-gray-600 mb-6">
              Tingkat kematangan cara kerja saat ini:
            </p>
            <div className="inline-block bg-primary text-white px-6 py-2 rounded-full font-semibold mb-6">
              {level}
            </div>
            <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
              Berdasarkan jawaban Anda, ada beberapa area yang bisa diperbaiki
              agar lebih rapi dan efisien. Silakan unduh template atau baca
              artikel yang relevan.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/"
                className="bg-accent text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-hover"
              >
                Kembali ke Beranda
              </Link>
              <button className="border border-primary text-primary px-5 py-2.5 rounded-lg font-semibold">
                Lihat Rekomendasi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary">
            Ragile<span className="text-accent">.</span>
          </Link>
          <span className="text-sm text-gray-500">
            {step + 1} / {currentQuestions.length || QUESTIONS.length}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="mb-2 text-xs font-medium text-accent uppercase tracking-wide">
            {current?.type === "key" ? "Pertanyaan Kunci" : "Pertanyaan Umum"}
          </div>
          <h1 className="text-xl font-bold text-primary mb-6">
            {current?.question}
          </h1>
          <div className="space-y-3">
            {current?.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition text-sm"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
