import { promises as fs } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import type {
  Conversation,
  IzinAnonim,
  Member,
  Message,
  ProblemRecord,
  StatusAlur,
  WaDraft,
} from "@/types";

export type ClinicStore = {
  members: Member[];
  problems: ProblemRecord[];
  conversations: Conversation[];
  messages: Message[];
  drafts: WaDraft[];
};

const emptyStore = (): ClinicStore => ({
  members: [],
  problems: [],
  conversations: [],
  messages: [],
  drafts: [],
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
  if (b.loaded) return;
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<ClinicStore>;
    b.data = {
      members: parsed.members || [],
      problems: parsed.problems || [],
      conversations: parsed.conversations || [],
      messages: parsed.messages || [],
      drafts: parsed.drafts || [],
    };
  } catch {
    b.data = emptyStore();
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
