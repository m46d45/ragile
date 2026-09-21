import { NextRequest, NextResponse } from "next/server";
import { setIzin } from "@/lib/store";
import type { IzinAnonim } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = String(body?.id || "");
  const izin = body?.izin as IzinAnonim;
  if (!id || !["ya", "tidak", "belum_ditanya"].includes(izin)) {
    return NextResponse.json({ error: "izin tidak valid" }, { status: 400 });
  }
  const row = await setIzin(id, izin);
  if (!row) return NextResponse.json({ error: "masalah tidak ada" }, { status: 404 });
  return NextResponse.json({ ok: true, izin: row.izin_anonim });
}
