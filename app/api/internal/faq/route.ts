import { NextRequest, NextResponse } from "next/server";
import { denyInternal, internalAuthorized } from "@/lib/internal-auth";
import {
  addFaqManual,
  listAllFaqs,
  listFaqUsulan,
  mergeUsulan,
  publishUsulan,
  rejectUsulan,
  updateFaq,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const [faqs, usulan] = await Promise.all([listAllFaqs(), listFaqUsulan()]);
  return NextResponse.json({
    faqs,
    usulan,
    catatan:
      "FAQ awal = seed. Pertanyaan baru yang belum pas masuk usulan. Terbit setelah ditinjau.",
  });
}

export async function POST(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const body = await req.json().catch(() => null);
  const action = String(body?.action || "");

  if (action === "jadikan") {
    const row = await publishUsulan({
      usulan_id: String(body?.usulan_id || ""),
      pertanyaan: String(body?.pertanyaan || ""),
      jawaban: String(body?.jawaban || ""),
      tags: Array.isArray(body?.tags) ? body.tags : [],
    });
    if (!row) return NextResponse.json({ error: "Usulan tidak ada." }, { status: 404 });
    return NextResponse.json(row);
  }

  if (action === "gabung") {
    const row = await mergeUsulan(String(body?.usulan_id || ""), String(body?.faq_id || ""));
    if (!row) return NextResponse.json({ error: "Usulan atau FAQ tidak ada." }, { status: 404 });
    return NextResponse.json(row);
  }

  if (action === "tolak") {
    const row = await rejectUsulan(String(body?.usulan_id || ""), body?.catatan);
    if (!row) return NextResponse.json({ error: "Usulan tidak ada." }, { status: 404 });
    return NextResponse.json({ usulan: row });
  }

  if (action === "simpan") {
    const row = await updateFaq(String(body?.id || ""), {
      pertanyaan: body?.pertanyaan,
      jawaban: body?.jawaban,
      tags: body?.tags,
      is_published: body?.is_published,
      urutan: body?.urutan,
    });
    if (!row) return NextResponse.json({ error: "FAQ tidak ada." }, { status: 404 });
    return NextResponse.json({ faq: row });
  }

  if (action === "manual") {
    const pertanyaan = String(body?.pertanyaan || "").trim();
    const jawaban = String(body?.jawaban || "").trim();
    if (!pertanyaan || !jawaban) {
      return NextResponse.json({ error: "Pertanyaan dan jawaban wajib." }, { status: 400 });
    }
    const faq = await addFaqManual({ pertanyaan, jawaban, tags: body?.tags, is_published: true });
    return NextResponse.json({ faq });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
}
