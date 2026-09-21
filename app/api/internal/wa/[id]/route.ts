import { NextRequest, NextResponse } from "next/server";
import { denyInternal, internalAuthorized } from "@/lib/internal-auth";
import { addMessage, getStore, setAlur, updateDraft, updateProblem } from "@/lib/store";

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!internalAuthorized(req)) return denyInternal();
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  const store = await getStore();
  const draft = store.drafts.find((d) => d.id === params.id);
  if (!draft) return NextResponse.json({ error: "Draf tidak ada." }, { status: 404 });

  const now = new Date().toISOString();

  if (action === "simpan") {
    const updated = await updateDraft(draft.id, {
      draf_final: String(body?.draf_final || draft.draf_final || ""),
      catatan_tim: body?.catatan_tim ?? draft.catatan_tim,
      status: "usul",
    });
    return NextResponse.json({ draft: updated });
  }

  if (action === "setujui") {
    const finalText = String(body?.draf_final || draft.draf_final || draft.draf_ai || "");
    const updated = await updateDraft(draft.id, {
      draf_final: finalText,
      status: "ok_abduh",
      decided_at: now,
      decided_by: String(body?.decided_by || "Abduh"),
    });
    if (draft.conversation_id) {
      await addMessage({
        conversation_id: draft.conversation_id,
        role: "tim",
        content: `[disetujui — belum terkirim otomatis]\n${finalText}`,
      });
    }
    await setAlur(draft.problem_id, "menunggu_ok");
    return NextResponse.json({
      draft: updated,
      note: "OK Abduh. Salin ke WhatsApp secara manual. Sistem tidak mengirim sendiri.",
    });
  }

  if (action === "terkirim") {
    const updated = await updateDraft(draft.id, { status: "terkirim", decided_at: now });
    await setAlur(draft.problem_id, "terkirim");
    return NextResponse.json({ draft: updated });
  }

  if (action === "bahas") {
    const updated = await updateDraft(draft.id, {
      jalur: "bahas_tim",
      status: "usul",
      catatan_tim: String(body?.catatan_tim || draft.catatan_tim || ""),
    });
    await setAlur(draft.problem_id, "bahas_tim");
    return NextResponse.json({ draft: updated });
  }

  if (action === "tingkat") {
    const tingkat = String(body?.tingkat || "");
    if (!["L0", "L1", "L2", "L3"].includes(tingkat)) {
      return NextResponse.json({ error: "Tingkat L0–L3." }, { status: 400 });
    }
    const problem = await updateProblem(draft.problem_id, {
      tingkat: tingkat as "L0" | "L1" | "L2" | "L3",
      tingkat_alasan: String(body?.tingkat_alasan || "Diatur di antrian."),
    });
    return NextResponse.json({ draft, problem });
  }

  if (action === "kajian") {
    await updateProblem(draft.problem_id, {
      status_alur: "kajian",
      pola_berulang: Boolean(body?.pola_berulang),
      lintas_lokasi: Boolean(body?.lintas_lokasi),
      lintas_orang: Boolean(body?.lintas_orang),
    });
    const updated = await updateDraft(draft.id, { status: "usul" });
    return NextResponse.json({ draft: updated });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
}
