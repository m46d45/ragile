import { NextRequest, NextResponse } from "next/server";
import { toRisetRow } from "@/lib/clinic";
import { denyInternal, internalAuthorized } from "@/lib/internal-auth";
import { getStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!internalAuthorized(req)) return denyInternal();
  const store = await getStore();
  const rows = store.problems.filter((p) => p.izin_anonim === "ya").map(toRisetRow);
  return NextResponse.json({
    catatan:
      "Hanya baris izin_anonim=ya. Tanpa nama, WA, cerita mentah, atau member_id.",
    jumlah: rows.length,
    rows,
  });
}
