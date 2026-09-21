import { NextRequest, NextResponse } from "next/server";
import { denyInternal, internalAuthorized } from "@/lib/internal-auth";
import { getStore, updateProblem } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const store = await getStore();
  const items = store.problems.filter(
    (p) =>
      p.tingkat === "L2" ||
      p.tingkat === "L3" ||
      p.status_alur === "kajian" ||
      p.status_alur === "siap_konsultansi" ||
      p.status_alur === "konsultansi"
  );
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const body = await req.json().catch(() => null);
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  const action = String(body?.action || "simpan");

  if (action === "konsultansi") {
    const row = await updateProblem(id, {
      catatan_kajian: body?.catatan_kajian,
      pola_berulang: Boolean(body?.pola_berulang),
      lintas_lokasi: Boolean(body?.lintas_lokasi),
      lintas_orang: Boolean(body?.lintas_orang),
      siap_konsultansi: true,
      status_alur: "konsultansi",
      reviewed_at: new Date().toISOString(),
    });
    return NextResponse.json({ item: row });
  }

  if (action === "siap") {
    const row = await updateProblem(id, {
      catatan_kajian: body?.catatan_kajian,
      pola_berulang: Boolean(body?.pola_berulang),
      lintas_lokasi: Boolean(body?.lintas_lokasi),
      lintas_orang: Boolean(body?.lintas_orang),
      siap_konsultansi: true,
      status_alur: "siap_konsultansi",
      reviewed_at: new Date().toISOString(),
    });
    return NextResponse.json({ item: row });
  }

  const row = await updateProblem(id, {
    catatan_kajian: body?.catatan_kajian,
    pola_berulang: Boolean(body?.pola_berulang),
    lintas_lokasi: Boolean(body?.lintas_lokasi),
    lintas_orang: Boolean(body?.lintas_orang),
    status_alur: "kajian",
  });
  return NextResponse.json({ item: row });
}
