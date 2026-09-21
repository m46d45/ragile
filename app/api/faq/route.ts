import { NextResponse } from "next/server";
import { listPublishedFaqs } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listPublishedFaqs();
  return NextResponse.json({
    items: items.map((f) => ({
      id: f.id,
      slug: f.slug,
      pertanyaan: f.pertanyaan,
      jawaban: f.jawaban,
      urutan: f.urutan,
    })),
  });
}
