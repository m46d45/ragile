import faqSeed from "@/data/faq.json";
import actionSeed from "@/data/action_bank.json";
import type {
  ActionItem,
  BotCodedFields,
  FaqItem,
  JenisMacet,
  ProblemRisetRow,
  ProblemRecord,
  SaatKetahuan,
  SeringMacet,
  TingkatEskalasi,
} from "@/types";

export const faqItems = faqSeed as FaqItem[];
export const actionItems = actionSeed as ActionItem[];

export const NON_KLAIM =
  "Bukan audit, bukan sertifikat, bukan janji hemat biaya. Hasilnya milik Anda.";

const JENIS: JenisMacet[] = [
  "tunggu_orang",
  "tunggu_alat",
  "ulang_kerja",
  "info_salah_terlambat",
  "lain",
];

export function findFaqMatches(text: string, limit = 3): FaqItem[] {
  const q = text.toLowerCase();
  const scored = faqItems.map((item) => {
    const hay = `${item.pertanyaan} ${item.jawaban} ${item.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const word of q.split(/\W+/).filter((w) => w.length > 3)) {
      if (hay.includes(word)) score += 1;
    }
    if (q.includes("tunggu") && hay.includes("tunggu")) score += 3;
    if ((q.includes("ulang") || q.includes("diulang")) && hay.includes("ulang")) {
      score += 3;
    }
    if (q.includes("audit") || q.includes("sertifikat") || q.includes("sbu")) {
      if (item.slug === "apakah-ini-audit") score += 5;
    }
    return { item, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

export function findAction(kode?: string | null): ActionItem | undefined {
  if (!kode) return undefined;
  return actionItems.find((a) => a.kode === kode);
}

export function suggestAction(jenis: JenisMacet): ActionItem | undefined {
  return actionItems.find((a) => a.jenis_macet.includes(jenis));
}

export function inferJenisMacet(text: string): JenisMacet {
  const t = text.toLowerCase();
  if (t.includes("alat") && (t.includes("tunggu") || t.includes("nunggu"))) {
    return "tunggu_alat";
  }
  if (
    t.includes("orang") &&
    (t.includes("tunggu") || t.includes("nunggu") || t.includes("tidak datang"))
  ) {
    return "tunggu_orang";
  }
  if (t.includes("tunggu") || t.includes("nunggu") || t.includes("menganggur")) {
    return "tunggu_orang";
  }
  if (t.includes("ulang") || t.includes("bongkar") || t.includes("dikerjakan lagi")) {
    return "ulang_kerja";
  }
  if (t.includes("jadwal") || t.includes("info salah") || t.includes("terlambat")) {
    return "info_salah_terlambat";
  }
  return "lain";
}

export function inferSering(text: string): SeringMacet {
  const t = text.toLowerCase();
  if (t.includes("sering") || t.includes("tiap hari") || t.includes("setiap")) {
    return "sering";
  }
  if (t.includes("sekali") || t.includes("jarang") || t.includes("baru kali")) {
    return "sekali_sekali";
  }
  return "belum_jelas";
}

export function inferSaat(text: string): SaatKetahuan {
  const t = text.toLowerCase();
  if (t.includes("pagi")) return "pagi";
  if (t.includes("siang") || t.includes("tengah")) return "tengah_hari";
  if (t.includes("sore") || t.includes("selesai") || t.includes("menjelang")) {
    return "menjelang_selesai";
  }
  return "belum_jelas";
}

export function inferTingkat(text: string, jenis: JenisMacet): TingkatEskalasi {
  const t = text.toLowerCase();
  const lintas =
    (t.includes("beberapa") && (t.includes("lokasi") || t.includes("proyek"))) ||
    t.includes("banyak orang") ||
    t.includes("tiap hari") ||
    t.includes("seminggu");
  const polaBaru =
    t.includes("metode baru") || t.includes("belum pernah") || t.includes("aneh");
  if (polaBaru && lintas) return "L3";
  if (lintas) return "L2";
  const adaTip = Boolean(suggestAction(jenis));
  if (adaTip && (jenis === "tunggu_orang" || jenis === "tunggu_alat" || jenis === "ulang_kerja")) {
    return "L0";
  }
  return "L1";
}

export function defaultCoded(text: string): BotCodedFields {
  const jenis_macet = inferJenisMacet(text);
  const tingkat = inferTingkat(text, jenis_macet);
  const action = tingkat === "L0" ? suggestAction(jenis_macet) : undefined;
  return {
    jenis_macet,
    sering: inferSering(text),
    saat_ketahuan: inferSaat(text),
    niat_ubah: text.toLowerCase().includes("cerita") ? "cerita_dulu" : "belum_ditanya",
    tingkat,
    tingkat_alasan:
      tingkat === "L0"
        ? "Mirip tip yang sudah ada di bank."
        : tingkat === "L1"
          ? "Mirip, tapi konteks belum ada aksi siap."
          : tingkat === "L2"
            ? "Menumpuk lintas hari/orang/lokasi — perlu kawan lapangan."
            : "Pola berulang / metode baru — masuk kajian.",
    escalate_wa: tingkat !== "L0",
    action_kode: action?.kode ?? null,
    ringkasan_lapangan: ringkas(text, jenis_macet),
  };
}

function ringkas(text: string, jenis: JenisMacet): string {
  const label: Record<JenisMacet, string> = {
    tunggu_orang: "Ada jeda menunggu orang.",
    tunggu_alat: "Ada jeda menunggu alat.",
    ulang_kerja: "Ada kerja yang harus diulang.",
    info_salah_terlambat: "Ada info atau jadwal yang macet.",
    lain: "Ada macet cara kerja yang belum masuk kotak tunggu/ulang.",
  };
  const potong = text.replace(/\s+/g, " ").trim().slice(0, 180);
  return `${label[jenis]} ${potong}`.trim();
}

export function fallbackReply(text: string, coded: BotCodedFields): string {
  const matches = findFaqMatches(text, 1);
  const action = findAction(coded.action_kode);
  const parts: string[] = [];

  if (matches[0]) {
    parts.push(matches[0].jawaban);
  } else if (action) {
    parts.push(action.isi_mandor);
  } else {
    parts.push(
      "Ini belum ada jawaban siap di FAQ. Jangan dipaksa selesai di bot. Kalau mau dibahas, kirim lewat WhatsApp — tidak kami balas otomatis."
    );
  }

  if (coded.tingkat === "L1") {
    parts.push(
      "Konteks ini masih baru. Belum ada aksi siap. Bisa antri dibahas tim dulu."
    );
  }
  if (coded.tingkat === "L2" || coded.tingkat === "L3") {
    parts.push(
      "Ini kelihatan perlu kajian lebih dalam dulu, baru konsultansi. Di WhatsApp kami tidak sebut riset — yang Anda terima nanti: kami kaji."
    );
  }
  parts.push(NON_KLAIM);
  return parts.join("\n\n");
}

export function toRisetRow(p: ProblemRecord): ProblemRisetRow {
  return {
    id: p.id,
    created_at: p.created_at,
    sumber_masuk: p.sumber_masuk,
    channel: p.channel,
    jenis_macet: p.jenis_macet,
    jenis_macet_lain: p.jenis_macet_lain,
    sering: p.sering,
    saat_ketahuan: p.saat_ketahuan,
    niat_ubah: p.niat_ubah,
    tingkat: p.tingkat,
    tingkat_alasan: p.tingkat_alasan,
    ringkasan_lapangan: p.ringkasan_lapangan,
    lokasi_umum: p.lokasi_umum,
    jenis_proyek: p.jenis_proyek,
    status_alur: p.status_alur,
    action_kode: p.action_kode,
    tip_diterapkan: p.tip_diterapkan,
    pola_berulang: p.pola_berulang,
    lintas_lokasi: p.lintas_lokasi,
    lintas_orang: p.lintas_orang,
  };
}

export function botSystemPrompt(): string {
  const faq = faqItems
    .map((f) => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`)
    .join("\n\n");
  const tips = actionItems
    .map((a) => `[${a.kode}] ${a.judul}: ${a.isi_mandor}`)
    .join("\n\n");

  return `Anda asisten singkat RagilE (Ragil Elektronic), klinik cara kerja lapangan untuk kontraktor kecil.

Aturan:
- Bahasa Indonesia lapangan, pendek, hormat. Bukan bahasa kampus.
- Berpijak pada FAQ dan tip di bawah. Jangan mengarang prosedur panjang.
- Jangan klaim audit, sertifikat, SBU, lean, atau hemat biaya.
- Jangan sebut paper, sampel, atau riset kepada kontraktor.
- Bot web hanya untuk pertanyaan singkat. Curhat dalam / pola menumpuk → sarankan WhatsApp. WA tidak otomatis: draf AI atau bahas tim, baru dikirim setelah disetujui manusia.
- L0: boleh 1 tip dari bank. L1: jujur belum ada aksi siap. L2/L3: kami kaji dulu, bukan konsultansi langsung.

FAQ:
${faq}

Tip L0:
${tips}

Balas HANYA JSON valid:
{
  "reply": "teks untuk kontraktor",
  "jenis_macet": "tunggu_orang|tunggu_alat|ulang_kerja|info_salah_terlambat|lain",
  "sering": "sering|sekali_sekali|belum_jelas",
  "saat_ketahuan": "pagi|tengah_hari|menjelang_selesai|belum_jelas",
  "niat_ubah": "mau_ubah|cerita_dulu|belum_ditanya",
  "tingkat": "L0|L1|L2|L3",
  "tingkat_alasan": "satu kalimat internal",
  "escalate_wa": true,
  "action_kode": "papan-tunggu|titik-periksa|lima-menit-pagi|satu-kebiasaan|null",
  "ringkasan_lapangan": "2-3 temuan lapangan, bukan skor"
}`;
}

export function parseBotJson(raw: string): (BotCodedFields & { reply: string }) | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    const data = JSON.parse(raw.slice(start, end + 1));
    if (typeof data.reply !== "string" || !data.reply.trim()) return null;
    const base = defaultCoded(data.ringkasan_lapangan || data.reply);
    return {
      reply: data.reply.trim(),
      jenis_macet: JENIS.includes(data.jenis_macet) ? data.jenis_macet : base.jenis_macet,
      sering: data.sering || base.sering,
      saat_ketahuan: data.saat_ketahuan || base.saat_ketahuan,
      niat_ubah: data.niat_ubah || base.niat_ubah,
      tingkat: data.tingkat || base.tingkat,
      tingkat_alasan: data.tingkat_alasan || base.tingkat_alasan,
      escalate_wa: Boolean(data.escalate_wa),
      action_kode:
        data.action_kode && data.action_kode !== "null" ? data.action_kode : null,
      ringkasan_lapangan: data.ringkasan_lapangan || base.ringkasan_lapangan,
    };
  } catch {
    return null;
  }
}
