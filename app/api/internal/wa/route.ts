import { NextRequest, NextResponse } from "next/server";
import { aiConfigured, completeJson } from "@/lib/ai";
import { botSystemPrompt, defaultCoded, fallbackReply, parseBotJson } from "@/lib/clinic";
import { denyInternal, internalAuthorized } from "@/lib/internal-auth";
import {
  addConversation,
  addDraft,
  addMember,
  addMessage,
  addProblem,
  getStore,
  listPublishedFaqs,
  recordIncomingQuestion,
} from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const store = await getStore();
  return NextResponse.json({
    drafts: store.drafts,
    problems: store.problems,
    members: store.members.map((m) => ({
      id: m.id,
      name: m.name,
      whatsapp: m.whatsapp,
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const body = await req.json().catch(() => null);
  const teks = String(body?.teks || "").trim();
  const jalur = body?.jalur === "bahas_tim" ? "bahas_tim" : "ai_draf";
  const whatsapp = String(body?.whatsapp || "").trim() || null;
  const nama = String(body?.nama || "").trim() || "Kontraktor WA";

  if (teks.length < 2) {
    return NextResponse.json({ error: "Tempel isi WA masuk." }, { status: 400 });
  }

  let memberId: string | null = null;
  if (whatsapp) {
    const member = await addMember({ name: nama, whatsapp, preferred_channel: "whatsapp" });
    memberId = member.id;
  }

  const conversation = await addConversation({
    channel: "whatsapp",
    member_id: memberId,
  });
  await addMessage({
    conversation_id: conversation.id,
    role: "user",
    content: teks,
  });

  const published = await listPublishedFaqs();
  const coded = defaultCoded(teks);
  let draf: string | null = null;

  if (jalur === "ai_draf") {
    if (aiConfigured()) {
      try {
        const raw = await completeJson(
          botSystemPrompt(published) +
            "\n\nIni draf balasan WhatsApp. Jangan kirim sendiri. Manusia yang menyetujui.",
          `WA masuk:\n${teks}`
        );
        const parsed = parseBotJson(raw);
        draf = parsed?.reply || fallbackReply(teks, coded, published);
        if (parsed) Object.assign(coded, parsed);
      } catch {
        draf = fallbackReply(teks, coded, published);
      }
    } else {
      draf = fallbackReply(teks, coded, published);
    }
  }

  const problem = await addProblem({
    sumber_masuk: "WA_langsung",
    channel: "whatsapp",
    jenis_macet: coded.jenis_macet,
    jenis_macet_lain: coded.jenis_macet_lain ?? null,
    sering: coded.sering,
    saat_ketahuan: coded.saat_ketahuan,
    niat_ubah: coded.niat_ubah,
    tingkat: coded.tingkat,
    tingkat_alasan: coded.tingkat_alasan ?? null,
    ringkasan_lapangan: coded.ringkasan_lapangan,
    cerita_mentah: teks,
    lokasi_umum: null,
    jenis_proyek: null,
    status_alur:
      coded.tingkat === "L2" || coded.tingkat === "L3"
        ? "kajian"
        : jalur === "bahas_tim"
          ? "bahas_tim"
          : "menunggu_ok",
    jalur_wa: jalur,
    action_kode: coded.action_kode ?? null,
    tip_diterapkan: null,
    izin_anonim: "belum_ditanya",
    catatan_kajian: null,
    pola_berulang: coded.tingkat === "L2" || coded.tingkat === "L3",
    lintas_lokasi: false,
    lintas_orang: false,
    siap_konsultansi: false,
    member_id: memberId,
    conversation_id: conversation.id,
    coded_by: "ai",
  });

  const draft = await addDraft({
    problem_id: problem.id,
    conversation_id: conversation.id,
    teks_masuk: teks,
    draf_ai: draf,
    draf_final: draf,
    jalur,
    status: jalur === "bahas_tim" ? "ditahan_tim" : "menunggu_ok",
    catatan_tim: null,
  });

  const faqSignal = await recordIncomingQuestion({
    text: teks,
    sumber: "whatsapp",
    problem_id: problem.id,
  });

  return NextResponse.json({ draft, problem, faq: { kind: faqSignal.kind, score: faqSignal.score } });
}
