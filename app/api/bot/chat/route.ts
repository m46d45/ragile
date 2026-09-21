import { NextRequest, NextResponse } from "next/server";
import { aiConfigured, completeJson } from "@/lib/ai";
import {
  botSystemPrompt,
  defaultCoded,
  fallbackReply,
  findAction,
  parseBotJson,
} from "@/lib/clinic";
import { addConversation, addMessage, addProblem, getStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text = String(body?.text || "").trim();
  const sessionId = String(body?.sessionId || "").slice(0, 80);

  if (text.length < 2) {
    return NextResponse.json({ error: "Tulis pertanyaan dulu." }, { status: 400 });
  }

  const store = await getStore();
  let conversation = store.conversations.find(
    (c) => c.session_id === sessionId && c.channel === "web"
  );
  if (!conversation) {
    conversation = await addConversation({ channel: "web", session_id: sessionId || null });
  }

  await addMessage({
    conversation_id: conversation.id,
    role: "user",
    content: text,
  });

  let reply: string;
  let coded = defaultCoded(text);
  let via: "ai" | "faq" = "faq";

  if (aiConfigured()) {
    try {
      const raw = await completeJson(
        botSystemPrompt(),
        `Pertanyaan kontraktor:\n${text}`
      );
      const parsed = parseBotJson(raw);
      if (parsed) {
        reply = parsed.reply;
        coded = parsed;
        via = "ai";
      } else {
        reply = fallbackReply(text, coded);
      }
    } catch {
      reply = fallbackReply(text, coded);
      reply += "\n\n(Asisten AI sedang tidak tersambung. Jawaban dari FAQ/tip.)";
    }
  } else {
    reply = fallbackReply(text, coded);
  }

  const action = findAction(coded.action_kode);
  if (action && !reply.includes(action.judul)) {
    reply += `\n\nTip: ${action.judul}. ${action.isi_mandor}`;
  }

  await addMessage({
    conversation_id: conversation.id,
    role: "assistant",
    content: reply,
  });

  const problem = await addProblem({
    sumber_masuk: "web_bot",
    channel: "web",
    jenis_macet: coded.jenis_macet,
    jenis_macet_lain: coded.jenis_macet_lain ?? null,
    sering: coded.sering,
    saat_ketahuan: coded.saat_ketahuan,
    niat_ubah: coded.niat_ubah,
    tingkat: coded.tingkat,
    tingkat_alasan: coded.tingkat_alasan ?? null,
    ringkasan_lapangan: coded.ringkasan_lapangan,
    cerita_mentah: text,
    lokasi_umum: null,
    jenis_proyek: null,
    status_alur: coded.tingkat === "L2" || coded.tingkat === "L3" ? "kajian" : "masuk",
    jalur_wa: "tidak_berlaku",
    action_kode: coded.action_kode ?? null,
    tip_diterapkan: null,
    izin_anonim: "belum_ditanya",
    catatan_kajian: null,
    pola_berulang: coded.tingkat === "L2" || coded.tingkat === "L3",
    lintas_lokasi: coded.tingkat === "L2" || coded.tingkat === "L3",
    lintas_orang: false,
    siap_konsultansi: false,
    member_id: null,
    conversation_id: conversation.id,
    coded_by: via === "ai" ? "ai" : "tim",
  });

  return NextResponse.json({
    reply,
    via,
    escalateToWa: coded.escalate_wa || coded.tingkat !== "L0",
    tingkat: coded.tingkat,
    action: action
      ? { kode: action.kode, judul: action.judul, isi_mandor: action.isi_mandor }
      : null,
    problemId: problem.id,
    izinPrompt: "Boleh kami simpan cerita ini tanpa nama, untuk belajar cara kerja lapangan? Mudah ditolak.",
  });
}
