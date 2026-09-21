import faqSeed from "@/data/faq.json";
import type { FaqItem, FaqUsulan, SumberUsulanFaq } from "@/types";

export const FAQ_MATCH_THRESHOLD = 4;
export const FAQ_USULAN_OVERLAP = 0.55;

type SeedRow = {
  id: string;
  slug: string;
  pertanyaan: string;
  jawaban: string;
  tags: string[];
  urutan: number;
};

export function hydrateFaqFromSeed(): FaqItem[] {
  const now = new Date().toISOString();
  return (faqSeed as SeedRow[]).map((row) => ({
    ...row,
    is_published: true,
    asal: "seed",
    kali_dipakai: 0,
    created_at: now,
    updated_at: now,
    published_at: now,
  }));
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 48) || "faq"
  );
}

export function normalizeTanya(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function overlapTanya(a: string, b: string): number {
  const wa = normalizeTanya(a).split(" ").filter((w) => w.length > 3);
  const wb = new Set(normalizeTanya(b).split(" ").filter((w) => w.length > 3));
  if (!wa.length || !wb.size) return 0;
  let n = 0;
  for (const w of wa) if (wb.has(w)) n += 1;
  return n / Math.min(wa.length, wb.size);
}

export function scoreFaqItems(
  text: string,
  items: FaqItem[]
): { item: FaqItem; score: number }[] {
  const q = text.toLowerCase();
  return items
    .map((item) => {
      const hay = `${item.pertanyaan} ${item.jawaban} ${item.tags.join(" ")}`.toLowerCase();
      let score = 0;
      for (const word of q.split(/\W+/).filter((w) => w.length > 3)) {
        if (item.pertanyaan.toLowerCase().includes(word)) score += 2;
        else if (hay.includes(word)) score += 1;
      }
      if (q.includes("bayar") || q.includes("gratis") || q.includes("biaya")) {
        if (item.slug === "ini-bayar") score += 6;
      }
      if (q.includes("bos") || q.includes("lapor")) {
        if (item.slug === "dikasih-ke-bos") score += 6;
      }
      if (q.includes("daftar") || q.includes("member") || q.includes("login")) {
        if (item.slug === "harus-daftar") score += 6;
      }
      if (q.includes("tunggu") || q.includes("nunggu")) {
        if (item.tags.includes("tunggu_orang") || item.tags.includes("tunggu_alat")) {
          score += 5;
        }
      }
      if (q.includes("ulang") || q.includes("diulang") || q.includes("bongkar")) {
        if (item.tags.includes("ulang_kerja")) score += 5;
      }
      if (q.includes("audit") || q.includes("sertifikat") || q.includes("sbu")) {
        if (item.slug === "apakah-ini-audit") score += 5;
      }
      if (
        (q.includes("whatsapp") || q.includes("bot") || q.includes("faq")) &&
        item.slug === "bot-dan-whatsapp"
      ) {
        score += 5;
      }
      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function findSimilarUsulan(text: string, open: FaqUsulan[]): FaqUsulan | undefined {
  let best: { row: FaqUsulan; score: number } | null = null;
  for (const row of open) {
    const score = Math.max(
      overlapTanya(text, row.pertanyaan_mentah),
      ...row.contoh_teks.map((c) => overlapTanya(text, c))
    );
    if (!best || score > best.score) best = { row, score };
  }
  if (best && best.score >= FAQ_USULAN_OVERLAP) return best.row;
  return undefined;
}

export type FaqSignal = {
  kind: "terjawab" | "calon";
  score: number;
  faq?: FaqItem;
  usulan?: FaqUsulan;
};

export function sumberDariChannel(channel: "web" | "whatsapp"): SumberUsulanFaq {
  return channel === "whatsapp" ? "whatsapp" : "web_bot";
}
