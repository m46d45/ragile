import { NextRequest, NextResponse } from "next/server";
import { bangunHasilPublik, defaultCoded, inferTingkat } from "@/lib/clinic";
import { addProblem } from "@/lib/store";
import type { JenisHambatan, SaatKetahuan, SeringHambatan } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const jenis = String(body?.jenis || "") as JenisHambatan;
  const sering = (String(body?.sering || "belum_jelas") as SeringHambatan) || "belum_jelas";
  const saat = (String(body?.saat || "belum_jelas") as SaatKetahuan) || "belum_jelas";
  const cerita = String(body?.cerita || "").trim();
  const lampiran = Boolean(body?.lampiran);

  const allowed: JenisHambatan[] = [
    "nunggu_orang",
    "nunggu_alat",
    "ulang_kerja",
    "info_salah_terlambat",
    "nunggu_serah_terima",
    "lain",
  ];
  if (!allowed.includes(jenis)) {
    return NextResponse.json({ error: "Pilih nunggu orang/alat atau kerja diulang dulu." }, { status: 400 });
  }

  const teks = [jenis, sering, saat, cerita].filter(Boolean).join(" ");
  const coded = defaultCoded(teks || jenis);
  coded.jenis_hambatan = jenis;
  coded.sering = sering;
  coded.saat_ketahuan = saat;
  coded.tingkat = inferTingkat(teks, jenis);
  const hasil = bangunHasilPublik({ jenis, sering, saat, cerita, lampiran });
  coded.action_kode = hasil.aksi[0]?.kode ?? null;
  coded.ringkasan_lapangan = hasil.yang_kebaca;

  const problem = await addProblem({
    sumber_masuk: "diagnosa",
    channel: "web",
    jenis_hambatan: jenis,
    jenis_hambatan_lain: null,
    sering,
    saat_ketahuan: saat,
    niat_ubah: cerita ? "cerita_dulu" : "belum_ditanya",
    tingkat: coded.tingkat,
    tingkat_alasan: coded.tingkat_alasan ?? null,
    ringkasan_lapangan: hasil.yang_kebaca,
    cerita_mentah: cerita || teks,
    lokasi_umum: null,
    jenis_proyek: null,
    status_alur: coded.tingkat === "L2" || coded.tingkat === "L3" ? "kajian" : "masuk",
    jalur_wa: "tidak_berlaku",
    action_kode: coded.action_kode,
    tip_diterapkan: null,
    izin_anonim: "belum_ditanya",
    catatan_kajian: null,
    pola_berulang: coded.tingkat === "L2" || coded.tingkat === "L3",
    lintas_lokasi: false,
    lintas_orang: false,
    siap_konsultansi: false,
    member_id: null,
    conversation_id: null,
    coded_by: "tim",
    referral_dari: null,
    lampiran_skor: hasil.lampiran_skor,
  });

  return NextResponse.json({
    hasil: {
      yang_kebaca: hasil.yang_kebaca,
      cerita_aman: hasil.cerita_aman,
      aksi: hasil.aksi.map((a) => ({
        nomor: a.nomor,
        slug: a.slug,
        judul: a.judul,
        isi: a.isi_mandor,
        href: `/aksi/${a.slug}`,
      })),
      tautan: hasil.tautan,
      lampiran_skor: hasil.lampiran_skor,
    },
    problemId: problem.id,
  });
}
