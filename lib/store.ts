import { promises as fs } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { migrateDraftStatus, normalizeProblem } from "@/lib/clinic";
import {
  FAQ_MATCH_THRESHOLD,
  LOCKED_FAQ_IDS,
  findSimilarUsulan,
  hydrateFaqFromSeed,
  scoreFaqItems,
  slugify,
  type FaqSignal,
} from "@/lib/faq";
import type {
  Conversation,
  FaqItem,
  FaqUsulan,
  IzinAnonim,
  Member,
  Message,
  ProblemRecord,
  StatusAlur,
  SumberUsulanFaq,
  WaDraft,
} from "@/types";

export type ClinicStore = {
  members: Member[];
  problems: ProblemRecord[];
  conversations: Conversation[];
  messages: Message[];
  drafts: WaDraft[];
  faqs: FaqItem[];
  faq_usulan: FaqUsulan[];
};

const emptyStore = (): ClinicStore => ({
  members: [],
  problems: [],
  conversations: [],
  messages: [],
  drafts: [],
  faqs: [],
  faq_usulan: [],
});

type GlobalStore = { data: ClinicStore; loaded: boolean };

function bucket(): GlobalStore {
  const g = globalThis as typeof globalThis & { __ragileStore?: GlobalStore };
  if (!g.__ragileStore) {
    g.__ragileStore = { data: emptyStore(), loaded: false };
  }
  return g.__ragileStore;
}

function storePath() {
  if (process.env.STORE_PATH) return process.env.STORE_PATH;
  if (process.env.VERCEL) return "/tmp/ragile-store.json";
  return path.join(process.cwd(), "data/runtime/store.json");
}

async function ensureLoaded() {
  const b = bucket();
  if (b.loaded) {
    if (!b.data.faq_usulan) b.data.faq_usulan = [];
    if (!b.data.faqs || b.data.faqs.length === 0) {
      b.data.faqs = hydrateFaqFromSeed();
    }
    return;
  }
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<ClinicStore>;
    b.data = {
      members: parsed.members || [],
      problems: (parsed.problems || []).map((p) =>
        normalizeProblem(p as unknown as Record<string, unknown>)
      ),
      conversations: parsed.conversations || [],
      messages: parsed.messages || [],
      drafts: (parsed.drafts || []).map((d) => ({
        ...d,
        status: migrateDraftStatus(d.status),
      })),
      faqs: parsed.faqs || [],
      faq_usulan: parsed.faq_usulan || [],
    };
  } catch {
    b.data = emptyStore();
  }
  if (!b.data.faqs) b.data.faqs = [];
  if (!b.data.faq_usulan) b.data.faq_usulan = [];
  const seed = hydrateFaqFromSeed();
  const seedIds = new Set(seed.map((s) => s.id));
  if (b.data.faqs.length === 0) {
    b.data.faqs = seed;
    await persist();
  } else {
    const byId = new Map(b.data.faqs.map((f) => [f.id, f]));
    for (const s of seed) {
      const existing = byId.get(s.id);
      if (!existing) {
        b.data.faqs.push(s);
        continue;
      }
      if (existing.asal === "seed") {
        existing.pertanyaan = s.pertanyaan;
        existing.jawaban = s.jawaban;
        existing.tags = s.tags;
        existing.urutan = s.urutan;
        existing.slug = s.slug;
        existing.locked = s.locked;
        existing.is_published = true;
      }
    }
    for (const f of b.data.faqs) {
      if (f.asal === "seed" && !seedIds.has(f.id)) {
        f.is_published = false;
      }
      if (LOCKED_FAQ_IDS.includes(f.id)) {
        f.locked = true;
        f.is_published = true;
      }
    }
    await persist();
  }
  b.loaded = true;
}

async function persist() {
  const file = storePath();
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(bucket().data, null, 2), "utf8");
  } catch {
    // serverless / read-only: tetap pakai memori proses
  }
}

export async function getStore(): Promise<ClinicStore> {
  await ensureLoaded();
  return bucket().data;
}

export async function addMember(partial: Pick<Member, "name"> & Partial<Member>) {
  await ensureLoaded();
  const now = new Date().toISOString();
  const member: Member = {
    id: uuid(),
    name: partial.name,
    company_name: partial.company_name ?? null,
    contractor_qualification: partial.contractor_qualification ?? null,
    main_field: partial.main_field ?? null,
    whatsapp: partial.whatsapp ?? null,
    email: partial.email ?? null,
    preferred_channel: partial.preferred_channel ?? "whatsapp",
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  bucket().data.members.push(member);
  await persist();
  return member;
}

export async function addConversation(
  partial: Pick<Conversation, "channel"> & Partial<Conversation>
) {
  await ensureLoaded();
  const row: Conversation = {
    id: uuid(),
    member_id: partial.member_id ?? null,
    session_id: partial.session_id ?? null,
    channel: partial.channel,
    status: partial.status ?? "active",
    started_at: new Date().toISOString(),
  };
  bucket().data.conversations.push(row);
  await persist();
  return row;
}

export async function addMessage(partial: Omit<Message, "id" | "created_at">) {
  await ensureLoaded();
  const row: Message = {
    ...partial,
    id: uuid(),
    created_at: new Date().toISOString(),
  };
  bucket().data.messages.push(row);
  await persist();
  return row;
}

export async function addProblem(
  partial: Omit<ProblemRecord, "id" | "created_at" | "updated_at">
) {
  await ensureLoaded();
  const now = new Date().toISOString();
  const row: ProblemRecord = {
    ...partial,
    id: uuid(),
    created_at: now,
    updated_at: now,
  };
  bucket().data.problems.unshift(row);
  await persist();
  return row;
}

export async function updateProblem(id: string, patch: Partial<ProblemRecord>) {
  await ensureLoaded();
  const row = bucket().data.problems.find((p) => p.id === id);
  if (!row) return null;
  Object.assign(row, patch, { updated_at: new Date().toISOString() });
  await persist();
  return row;
}

export async function setIzin(id: string, izin: IzinAnonim) {
  return updateProblem(id, {
    izin_anonim: izin,
    izin_ditanya_at: new Date().toISOString(),
  });
}

export async function setAlur(id: string, status_alur: StatusAlur) {
  return updateProblem(id, { status_alur });
}

export async function addDraft(partial: Omit<WaDraft, "id" | "created_at">) {
  await ensureLoaded();
  const row: WaDraft = {
    ...partial,
    id: uuid(),
    created_at: new Date().toISOString(),
  };
  bucket().data.drafts.unshift(row);
  await persist();
  return row;
}

export async function updateDraft(id: string, patch: Partial<WaDraft>) {
  await ensureLoaded();
  const row = bucket().data.drafts.find((d) => d.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  await persist();
  return row;
}

export async function getProblem(id: string) {
  await ensureLoaded();
  return bucket().data.problems.find((p) => p.id === id) || null;
}

export async function listMessages(conversationId: string) {
  await ensureLoaded();
  return bucket().data.messages.filter((m) => m.conversation_id === conversationId);
}

export async function listPublishedFaqs() {
  await ensureLoaded();
  return bucket()
    .data.faqs.filter((f) => f.is_published)
    .sort((a, b) => a.urutan - b.urutan);
}

export async function listAllFaqs() {
  await ensureLoaded();
  return [...bucket().data.faqs].sort((a, b) => a.urutan - b.urutan);
}

export async function listFaqUsulan() {
  await ensureLoaded();
  return bucket().data.faq_usulan;
}

export async function recordIncomingQuestion(input: {
  text: string;
  sumber: SumberUsulanFaq;
  problem_id?: string | null;
}): Promise<FaqSignal> {
  await ensureLoaded();
  const published = bucket().data.faqs.filter((f) => f.is_published);
  const ranked = scoreFaqItems(input.text, published);
  const top = ranked[0];

  if (top && top.score >= FAQ_MATCH_THRESHOLD) {
    top.item.kali_dipakai += 1;
    top.item.updated_at = new Date().toISOString();
    await persist();
    return { kind: "terjawab", score: top.score, faq: top.item };
  }

  const open = bucket().data.faq_usulan.filter(
    (u) => u.status === "calon" || u.status === "ditinjau"
  );
  const existing = findSimilarUsulan(input.text, open);
  const now = new Date().toISOString();

  if (existing) {
    existing.kali_muncul += 1;
    existing.updated_at = now;
    if (!existing.contoh_teks.includes(input.text)) {
      existing.contoh_teks = [...existing.contoh_teks.slice(-4), input.text];
    }
    if (input.problem_id) existing.problem_id = input.problem_id;
    await persist();
    return { kind: "calon", score: top?.score || 0, usulan: existing, faq: top?.item };
  }

  const usulan: FaqUsulan = {
    id: uuid(),
    pertanyaan_mentah: input.text,
    ringkasan: input.text.slice(0, 180),
    sumber: input.sumber,
    problem_id: input.problem_id ?? null,
    status: "calon",
    mirip_faq_id: top?.item.id ?? null,
    faq_id: null,
    kali_muncul: 1,
    contoh_teks: [input.text],
    catatan_tim: null,
    created_at: now,
    updated_at: now,
  };
  bucket().data.faq_usulan.unshift(usulan);
  await persist();
  return { kind: "calon", score: top?.score || 0, usulan, faq: top?.item };
}

export async function publishUsulan(input: {
  usulan_id: string;
  pertanyaan: string;
  jawaban: string;
  tags?: string[];
}) {
  await ensureLoaded();
  const usulan = bucket().data.faq_usulan.find((u) => u.id === input.usulan_id);
  if (!usulan) return null;
  const now = new Date().toISOString();
  const faq: FaqItem = {
    id: uuid(),
    slug: `${slugify(input.pertanyaan)}-${Date.now().toString(36)}`,
    pertanyaan: input.pertanyaan.trim(),
    jawaban: input.jawaban.trim(),
    tags: input.tags || [],
    urutan: bucket().data.faqs.length + 1,
    is_published: true,
    asal: "usulan",
    kali_dipakai: usulan.kali_muncul,
    created_at: now,
    updated_at: now,
    published_at: now,
  };
  bucket().data.faqs.push(faq);
  usulan.status = "jadi_faq";
  usulan.faq_id = faq.id;
  usulan.updated_at = now;
  await persist();
  return { faq, usulan };
}

export async function mergeUsulan(usulan_id: string, faq_id: string) {
  await ensureLoaded();
  const usulan = bucket().data.faq_usulan.find((u) => u.id === usulan_id);
  const faq = bucket().data.faqs.find((f) => f.id === faq_id);
  if (!usulan || !faq) return null;
  faq.kali_dipakai += usulan.kali_muncul;
  faq.updated_at = new Date().toISOString();
  usulan.status = "digabung";
  usulan.faq_id = faq.id;
  usulan.updated_at = faq.updated_at;
  await persist();
  return { faq, usulan };
}

export async function rejectUsulan(usulan_id: string, catatan?: string) {
  await ensureLoaded();
  const usulan = bucket().data.faq_usulan.find((u) => u.id === usulan_id);
  if (!usulan) return null;
  usulan.status = "ditolak";
  usulan.catatan_tim = catatan ?? usulan.catatan_tim;
  usulan.updated_at = new Date().toISOString();
  await persist();
  return usulan;
}

export async function updateFaq(id: string, patch: Partial<FaqItem>) {
  await ensureLoaded();
  const row = bucket().data.faqs.find((f) => f.id === id);
  if (!row) return null;
  if (row.locked || LOCKED_FAQ_IDS.includes(row.id)) {
    const rest: Partial<FaqItem> = { ...patch };
    delete rest.is_published;
    delete rest.pertanyaan;
    delete rest.jawaban;
    Object.assign(row, rest, {
      locked: true,
      is_published: true,
      updated_at: new Date().toISOString(),
    });
    await persist();
    return row;
  }
  Object.assign(row, patch, { updated_at: new Date().toISOString() });
  await persist();
  return row;
}

export async function addFaqManual(input: {
  pertanyaan: string;
  jawaban: string;
  tags?: string[];
  is_published?: boolean;
}) {
  await ensureLoaded();
  const now = new Date().toISOString();
  const published = input.is_published !== false;
  const row: FaqItem = {
    id: uuid(),
    slug: `${slugify(input.pertanyaan)}-${Date.now().toString(36)}`,
    pertanyaan: input.pertanyaan.trim(),
    jawaban: input.jawaban.trim(),
    tags: input.tags || [],
    urutan: bucket().data.faqs.length + 1,
    is_published: published,
    asal: "usulan",
    kali_dipakai: 0,
    created_at: now,
    updated_at: now,
    published_at: published ? now : null,
  };
  bucket().data.faqs.push(row);
  await persist();
  return row;
}

