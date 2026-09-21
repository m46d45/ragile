import { NextRequest, NextResponse } from "next/server";

export function internalAuthorized(req: NextRequest): boolean {
  const expected = process.env.INTERNAL_PASS;
  if (!expected) return true;
  const sent =
    req.headers.get("x-internal-key") ||
    req.nextUrl.searchParams.get("k") ||
    "";
  return sent === expected;
}

export function denyInternal() {
  return NextResponse.json({ error: "Halaman internal. Kunci tidak cocok." }, { status: 401 });
}
