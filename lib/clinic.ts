import actionSeed from "@/data/action_bank.json";
import { hydrateFaqFromSeed, scoreFaqItems } from "@/lib/faq";
import type {
  ActionItem,
  BotCodedFields,
  FaqItem,
  HasilPublik,
  JenisHambatan,
  ProblemRecord,
  ProblemRisetRow,
  SaatKetahuan,
  SeringHambatan,
  StatusDraf,
  TingkatEskalasi,
} from "@/types";

export const faqItems = hydrateFaqFromSeed();
export const actionItems = (actionSeed as ActionItem[]).slice().sort((a, b) => a.nomor - b.nomor);

export const CERITA_AMAN = "Cerita Anda tidak kami teruskan ke orang lain.";

export const JENIS_HAMBATAN: JenisHambatan[] = [
  "nunggu_orang",
  "nunggu_alat",
  "ulang_kerja",
  "info_salah_terlambat",
  "nunggu_serah_terima",
  "lain",
];

export const LABEL_HAMBATAN: Record<JenisHambatan, string> = {
  nunggu_orang: "nunggu orang",
  nunggu_alat: "nunggu alat",
  ulang_kerja: "kerja diulang",
  info_salah_terlambat: "info salah / terlambat",
  nunggu_serah_terima: "nunggu serah terima",
  lain: "lain",
};

export const TINGKAT: TingkatEskalasi[] = ["L0", "L1", "L2", "L3"];

export function migrateJenisHambatan(value: unknown): JenisHambatan {
  const raw = String(value || "");
  if (raw === "tunggu_orang") return "nunggu_orang";
  if (raw === "tunggu_alat") return "nunggu_alat";
  if (JENIS_HAMBATAN.includes(raw as JenisHambatan)) return raw as JenisHambatan;
  return "lain";
}

export function migrateDraftStatus(value: unknown): StatusDraf {
  const raw = String(value || "");
  if (raw === "ok_abduh" || raw === "disetujui") return "ok_abduh";
  if (raw === "terkirim") return "terkirim";
  return "usul";
}

export function labelStatusDraf(status: StatusDraf): string {
  if (status === "ok_abduh") return "OK Abduh";
  if (status === "terkirim") return "sudah disalin ke WA";
  return "usul";
}

export function findFaqMatches(
  text: string,
  items: FaqItem[] = faqItems,
  limit = 3
): FaqItem[] {
  return scoreFaqItems(text, items)
    .slice(0, limit)
    .map((s) => s.item);
}

export function findAction(kode?: string | null): ActionItem | undefined {
  if (!kode) return undefined;
  return actionItems.find((a) => a.kode === kode || a.slug === kode || String(a.nomor) === kode);
}

export function findActionBySlug(slug: string): ActionItem | undefined {
  return actionItems.find((a) => a.slug === slug || String(a.nomor) === slug);
}

export function suggestAction(jenis: JenisHambatan): ActionItem | undefined {
  return actionItems.find((a) => a.jenis_hambatan.includes(jenis));
}

export function pilihAksi(
  jenis: JenisHambatan,
  saat: SaatKetahuan = "belum_jelas",
  limit = 3
): ActionItem[] {
  const scored = actionItems.map((a) => {
    let score = 0;
    if (a.jenis_hambatan.includes(jenis)) score += 4;
    if (jenis === "nunggu_orang" || jenis === "nunggu_alat") {
      if (a.nomor === 1) score += saat === "pagi" ? 5 : 3;
      if (a.nomor === 2) score += 2;
      if (a.nomor === 4) score += 1;
    }
    if (jenis === "ulang_kerja") {
      if (a.nomor === 3) score += 5;
      if (a.nomor === 4) score += 2;
      if (a.nomor === 5) score += 1;
    }
    if (jenis === "nunggu_serah_terima") {
      if (a.nomor === 5) score += 5;
      if (a.nomor === 4) score += 2;
      if (a.nomor === 2) score += 1;
    }
    if (jenis === "info_salah_terlambat") {
      if (a.nomor === 4) score += 4;
      if (a.nomor === 2) score += 3;
      if (a.nomor === 1) score += 2;
    }
    if (jenis === "lain" && a.nomor === 4) score += 3;
    return { a, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.a.nomor - y.a.nomor)
    .slice(0, limit)
    .map((x) => x.a);
}

export function inferJenisHambatan(text: string): JenisHambatan {
  const t = text.toLowerCase();
  if (t.includes("serah") || t.includes("terima")) return "nunggu_serah_terima";
  if (t.includes("alat") && (t.includes("tunggu") || t.includes("nunggu"))) {
    return "nunggu_alat";
  }
  if (
    t.includes("orang") &&
    (t.includes("tunggu") || t.includes("nunggu") || t.includes("tidak datang") || t.includes("belum datang"))
  ) {
    return "nunggu_orang";
  }
  if (t.includes("tunggu") || t.includes("nunggu") || t.includes("menganggur")) {
    return "nunggu_orang";
  }
  if (t.includes("ulang") || t.includes("bongkar") || t.includes("dikerjakan lagi") || t.includes("diulang")) {
    return "ulang_kerja";
  }
  if (t.includes("jadwal") || t.includes("info salah") || t.includes("terlambat")) {
    return "info_salah_terlambat";
  }
  return "lain";
}

export function inferSering(text: string): SeringHambatan {
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

export function inferTingkat(text: string, jenis: JenisHambatan): TingkatEskalasi {
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
  const adaAksi = Boolean(suggestAction(jenis));
  if (
    adaAksi &&
    (jenis === "nunggu_orang" ||
      jenis === "nunggu_alat" ||
      jenis === "ulang_kerja" ||
      jenis === "nunggu_serah_terima")
  ) {
    return "L0";
  }
  return "L1";
}

export function defaultCoded(text: string): BotCodedFields {
  const jenis_hambatan = inferJenisHambatan(text);
  const saat_ketahuan = inferSaat(text);
  const tingkat = inferTingkat(text, jenis_hambatan);
  const action = tingkat === "L0" ? pilihAksi(jenis_hambatan, saat_ketahuan, 1)[0] : undefined;
  return {
    jenis_hambatan,
    sering: inferSering(text),
    saat_ketahuan,
    niat_ubah: text.toLowerCase().includes("cerita") ? "cerita_dulu" : "belum_ditanya",
    tingkat,
    tingkat_alasan:
      tingkat === "L0"
        ? "Mirip aksi yang sudah ada di bank."
        : tingkat === "L1"
          ? "Mirip, tapi konteks belum ada aksi siap."
          : tingkat === "L2"
            ? "Menumpuk lintas hari/orang/lokasi — perlu kawan lapangan."
            : "Pola berulang / metode baru — masuk kajian.",
    escalate_wa: tingkat !== "L0",
    action_kode: action?.kode ?? null,
    ringkasan_lapangan: ringkas(text, jenis_hambatan, saat_ketahuan),
  };
}

export function ringkas(
  text: string,
  jenis: JenisHambatan,
  saat: SaatKetahuan = "belum_jelas"
): string {
  const kapan =
    saat === "pagi"
      ? "pagi"
      : saat === "tengah_hari"
        ? "tengah hari"
        : saat === "menjelang_selesai"
          ? "menjelang selesai"
          : "";
  const label: Record<JenisHambatan, string> = {
    nunggu_orang: kapan
      ? `${kapan[0].toUpperCase()}${kapan.slice(1)} di lokasi nunggu orang, jadi kerja belum jalan.`
      : "Di lokasi nunggu orang, jadi kerja belum jalan.",
    nunggu_alat: kapan
      ? `${kapan[0].toUpperCase()}${kapan.slice(1)} di lokasi nunggu alat, jadi kerja belum jalan.`
      : "Di lokasi nunggu alat, jadi kerja belum jalan.",
    ulang_kerja: kapan
      ? `Hasil kerja harus dikerjakan ulang, biasanya ketahuan ${kapan}.`
      : "Hasil kerja harus dikerjakan ulang.",
    info_salah_terlambat: "Info atau jadwal datang terlambat / tidak sama.",
    nunggu_serah_terima: "Kerja berhenti karena nunggu serah terima.",
    lain: "Ada yang bikin kerja berhenti, belum masuk kotak nunggu atau diulang.",
  };
  const potong = text.replace(/\s+/g, " ").trim().slice(0, 160);
  return potong ? `${label[jenis]} ${potong}`.trim() : label[jenis];
}

export function bangunHasilPublik(input: {
  jenis: JenisHambatan;
  sering?: SeringHambatan;
  saat?: SaatKetahuan;
  cerita?: string;
  lampiran?: boolean;
}): HasilPublik {
  const saat = input.saat || "belum_jelas";
  const aksi = pilihAksi(input.jenis, saat, 3);
  const seringTeks =
    input.sering === "sering"
      ? " Ini sering terjadi."
      : input.sering === "sekali_sekali"
        ? " Sekali-sekali."
        : "";
  return {
    yang_kebaca: `${ringkas(input.cerita || "", input.jenis, saat)}${seringTeks}`.trim(),
    cerita_aman: CERITA_AMAN,
    aksi,
    tautan: [
      ...aksi.map((a) => ({ href: `/aksi/${a.slug}`, label: a.judul })),
      { href: "/faq", label: "Yang sering ditanya" },
    ],
    lampiran_skor: input.lampiran ? "terlihat" : "belum_terlihat",
  };
}

export function fallbackReply(
  text: string,
  coded: BotCodedFields,
  items: FaqItem[] = faqItems
): string {
  const matches = findFaqMatches(text, items, 1);
  const action = findAction(coded.action_kode);
  const parts: string[] = [];

  if (matches[0]) {
    parts.push(matches[0].jawaban);
  } else if (action) {
    parts.push(action.isi_mandor);
  } else {
    parts.push(
      "Ini belum ada jawaban siap. Jangan dipaksa selesai di sini. Kalau mau dibahas, kirim lewat WhatsApp — tidak kami balas otomatis."
    );
  }

  if (coded.tingkat === "L1") {
    parts.push("Konteks ini masih baru. Belum ada yang siap dicoba minggu ini. Bisa antri dibahas dulu.");
  }
  if (coded.tingkat === "L2" || coded.tingkat === "L3") {
    parts.push("Ini kelihatan perlu dibahas lebih dalam. Di WhatsApp yang Anda terima nanti: kami kaji dulu.");
  }
  parts.push(CERITA_AMAN);
  return parts.join("\n\n");
}

export function toRisetRow(p: ProblemRecord): ProblemRisetRow {
  return {
    id: p.id,
    created_at: p.created_at,
    sumber_masuk: p.sumber_masuk,
    channel: p.channel,
    jenis_hambatan: p.jenis_hambatan,
    jenis_hambatan_lain: p.jenis_hambatan_lain,
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
    referral_dari: p.referral_dari ?? null,
  };
}

export function botSystemPrompt(items: FaqItem[] = faqItems): string {
  const faq = items
    .filter((f) => f.is_published)
    .map((f) => `Q: ${f.pertanyaan}\nA: ${f.jawaban}`)
    .join("\n\n");
  const aksi = actionItems
    .map((a) => `[internal ${a.kode} / publik aksi ${a.nomor}] ${a.judul}: ${a.isi_mandor}`)
    .join("\n\n");

  return `Anda asisten singkat RagilE. Bahasa lapangan untuk kontraktor kecil.

Aturan:
- Bahasa Indonesia lapangan, pendek, hormat. Bukan bahasa kampus.
- Berpijak pada FAQ dan aksi di bawah. Jangan mengarang prosedur panjang.
- Jangan klaim lean, audit, sertifikat, SBU, atau hemat biaya.
- Jangan sebut paper, sampel, riset, L0, macet, klinik, IAMKRI, atau kode internal kepada kontraktor.
- Publik: nunggu / diulang / mandor / berangkat.
- Bot web hanya untuk pertanyaan singkat. Curhat dalam / pola menumpuk → sarankan WhatsApp. WA tidak otomatis: draf, baru dikirim setelah OK Abduh.
- Kalau mirip aksi 1–5, boleh sebut judul aksi (tanpa kode). Kalau belum ada yang siap, jujur.

FAQ:
${faq}

Aksi (internal L0-01..05):
${aksi}

Balas HANYA JSON valid:
{
  "reply": "teks untuk kontraktor",
  "jenis_hambatan": "nunggu_orang|nunggu_alat|ulang_kerja|info_salah_terlambat|nunggu_serah_terima|lain",
  "sering": "sering|sekali_sekali|belum_jelas",
  "saat_ketahuan": "pagi|tengah_hari|menjelang_selesai|belum_jelas",
  "niat_ubah": "mau_ubah|cerita_dulu|belum_ditanya",
  "tingkat": "L0|L1|L2|L3",
  "tingkat_alasan": "satu kalimat internal",
  "escalate_wa": true,
  "action_kode": "L0-01|L0-02|L0-03|L0-04|L0-05|null",
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
    const jenis = migrateJenisHambatan(data.jenis_hambatan || data.jenis_macet || base.jenis_hambatan);
    return {
      reply: data.reply.trim(),
      jenis_hambatan: jenis,
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

export function normalizeProblem(raw: Record<string, unknown>): ProblemRecord {
  const jenis = migrateJenisHambatan(raw.jenis_hambatan ?? raw.jenis_macet);
  const tingkat = TINGKAT.includes(raw.tingkat as TingkatEskalasi)
    ? (raw.tingkat as TingkatEskalasi)
    : inferTingkat(String(raw.cerita_mentah || raw.ringkasan_lapangan || ""), jenis);
  return {
    id: String(raw.id),
    created_at: String(raw.created_at || new Date().toISOString()),
    updated_at: String(raw.updated_at || raw.created_at || new Date().toISOString()),
    sumber_masuk: (raw.sumber_masuk as ProblemRecord["sumber_masuk"]) || "lain",
    channel: (raw.channel as ProblemRecord["channel"]) || "web",
    jenis_hambatan: jenis,
    jenis_hambatan_lain: (raw.jenis_hambatan_lain as string) ?? (raw.jenis_macet_lain as string) ?? null,
    sering: (raw.sering as ProblemRecord["sering"]) || "belum_jelas",
    saat_ketahuan: (raw.saat_ketahuan as ProblemRecord["saat_ketahuan"]) || "belum_jelas",
    niat_ubah: (raw.niat_ubah as ProblemRecord["niat_ubah"]) || "belum_ditanya",
    tingkat,
    tingkat_alasan: (raw.tingkat_alasan as string) ?? null,
    ringkasan_lapangan: String(raw.ringkasan_lapangan || ""),
    cerita_mentah: String(raw.cerita_mentah || ""),
    lokasi_umum: (raw.lokasi_umum as string) ?? null,
    jenis_proyek: (raw.jenis_proyek as string) ?? null,
    status_alur: (raw.status_alur as ProblemRecord["status_alur"]) || "masuk",
    jalur_wa: (raw.jalur_wa as ProblemRecord["jalur_wa"]) || "tidak_berlaku",
    action_kode: (raw.action_kode as string) ?? null,
    tip_diterapkan: (raw.tip_diterapkan as boolean) ?? null,
    izin_anonim: (raw.izin_anonim as ProblemRecord["izin_anonim"]) || "belum_ditanya",
    izin_ditanya_at: (raw.izin_ditanya_at as string) ?? null,
    catatan_kajian: (raw.catatan_kajian as string) ?? null,
    pola_berulang: Boolean(raw.pola_berulang),
    lintas_lokasi: Boolean(raw.lintas_lokasi),
    lintas_orang: Boolean(raw.lintas_orang),
    siap_konsultansi: Boolean(raw.siap_konsultansi),
    member_id: (raw.member_id as string) ?? null,
    conversation_id: (raw.conversation_id as string) ?? null,
    coded_by: (raw.coded_by as ProblemRecord["coded_by"]) || "tim",
    reviewed_at: (raw.reviewed_at as string) ?? null,
    referral_dari: (raw.referral_dari as string) ?? null,
    lampiran_skor:
      raw.lampiran_skor === "terlihat" || raw.lampiran_skor === "belum_terlihat"
        ? raw.lampiran_skor
        : "belum_terlihat",
  };
}
