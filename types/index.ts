export type ContractorQualification =
  | "K1"
  | "K2"
  | "K3"
  | "Perorangan"
  | "Belum SBU"
  | "Lainnya";

export type PreferredChannel = "whatsapp" | "email" | "both";

/** Identitas. Tidak ikut ekspor riset. */
export interface Member {
  id: string;
  name: string;
  company_name?: string | null;
  contractor_qualification?: ContractorQualification | null;
  main_field?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  preferred_channel: PreferredChannel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SumberMasuk =
  | "referral"
  | "IAMKRI"
  | "WA_langsung"
  | "event"
  | "web_bot"
  | "diagnosa"
  | "lain";

export type ChannelMasuk = "web" | "whatsapp" | "event" | "lain";

/** Bank field. Nilai publik: nunggu/diulang — tanpa kata macet. */
export type JenisHambatan =
  | "nunggu_orang"
  | "nunggu_alat"
  | "ulang_kerja"
  | "info_salah_terlambat"
  | "nunggu_serah_terima"
  | "lain";

/** @deprecated pakai JenisHambatan */
export type JenisMacet = JenisHambatan;

export type SeringHambatan = "sering" | "sekali_sekali" | "belum_jelas";
/** @deprecated pakai SeringHambatan */
export type SeringMacet = SeringHambatan;

export type SaatKetahuan =
  | "pagi"
  | "tengah_hari"
  | "menjelang_selesai"
  | "belum_jelas";

export type NiatUbah = "mau_ubah" | "cerita_dulu" | "belum_ditanya";

export type TingkatEskalasi = "L0" | "L1" | "L2" | "L3";

export type StatusAlur =
  | "masuk"
  | "draf_ai"
  | "bahas_tim"
  | "menunggu_ok"
  | "terkirim"
  | "kajian"
  | "siap_konsultansi"
  | "konsultansi"
  | "ditutup";

export type JalurWa = "ai_draf" | "bahas_tim" | "tidak_berlaku";

export type IzinAnonim = "ya" | "tidak" | "belum_ditanya";

export type CodedBy = "ai" | "tim";

/** Satu masalah lapangan. Selalu disimpan. Identitas hanya lewat member_id. */
export interface ProblemRecord {
  id: string;
  created_at: string;
  updated_at: string;
  sumber_masuk: SumberMasuk;
  channel: ChannelMasuk;
  jenis_hambatan: JenisHambatan;
  jenis_hambatan_lain?: string | null;
  sering: SeringHambatan;
  saat_ketahuan: SaatKetahuan;
  niat_ubah: NiatUbah;
  tingkat: TingkatEskalasi;
  tingkat_alasan?: string | null;
  ringkasan_lapangan: string;
  cerita_mentah: string;
  lokasi_umum?: string | null;
  jenis_proyek?: string | null;
  status_alur: StatusAlur;
  jalur_wa: JalurWa;
  action_kode?: string | null;
  tip_diterapkan?: boolean | null;
  izin_anonim: IzinAnonim;
  izin_ditanya_at?: string | null;
  catatan_kajian?: string | null;
  pola_berulang: boolean;
  lintas_lokasi: boolean;
  lintas_orang: boolean;
  siap_konsultansi: boolean;
  member_id?: string | null;
  conversation_id?: string | null;
  coded_by: CodedBy;
  reviewed_at?: string | null;
  /** Opsional: "dari Pak/Bu X" */
  referral_dari?: string | null;
  lampiran_skor?: "terlihat" | "belum_terlihat";
}

/** Baris ekspor riset: tanpa WA, nama, cerita mentah, member_id. */
export interface ProblemRisetRow {
  id: string;
  created_at: string;
  sumber_masuk: SumberMasuk;
  channel: ChannelMasuk;
  jenis_hambatan: JenisHambatan;
  jenis_hambatan_lain?: string | null;
  sering: SeringHambatan;
  saat_ketahuan: SaatKetahuan;
  niat_ubah: NiatUbah;
  tingkat: TingkatEskalasi;
  tingkat_alasan?: string | null;
  ringkasan_lapangan: string;
  lokasi_umum?: string | null;
  jenis_proyek?: string | null;
  status_alur: StatusAlur;
  action_kode?: string | null;
  tip_diterapkan?: boolean | null;
  pola_berulang: boolean;
  lintas_lokasi: boolean;
  lintas_orang: boolean;
  referral_dari?: string | null;
}

export type FaqAsal = "seed" | "usulan";

export interface FaqItem {
  id: string;
  slug: string;
  pertanyaan: string;
  jawaban: string;
  tags: string[];
  urutan: number;
  is_published: boolean;
  asal: FaqAsal;
  kali_dipakai: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  locked?: boolean;
}

export type StatusUsulanFaq =
  | "calon"
  | "ditinjau"
  | "jadi_faq"
  | "digabung"
  | "ditolak";

export type SumberUsulanFaq = "web_bot" | "whatsapp" | "manual";

/** Pertanyaan yang belum / tidak pas di FAQ terbit. Menumpuk → jadi FAQ baru. */
export interface FaqUsulan {
  id: string;
  pertanyaan_mentah: string;
  ringkasan?: string | null;
  sumber: SumberUsulanFaq;
  problem_id?: string | null;
  status: StatusUsulanFaq;
  mirip_faq_id?: string | null;
  faq_id?: string | null;
  kali_muncul: number;
  contoh_teks: string[];
  catatan_tim?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  kode: string;
  nomor: number;
  slug: string;
  judul: string;
  isi_mandor: string;
  file_url?: string | null;
  jenis_hambatan: JenisHambatan[];
  tingkat: TingkatEskalasi;
}

export type ConversationStatus = "active" | "closed" | "escalated";
export type ConversationChannel = "web" | "whatsapp";

export interface Conversation {
  id: string;
  member_id?: string | null;
  session_id?: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  started_at: string;
  closed_at?: string | null;
}

export type MessageRole = "user" | "assistant" | "system" | "tim";

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

/** Alur publik internal: usul → OK Abduh → terkirim */
export type StatusDraf = "usul" | "ok_abduh" | "terkirim";

export interface WaDraft {
  id: string;
  problem_id: string;
  conversation_id?: string | null;
  teks_masuk: string;
  draf_ai?: string | null;
  draf_final?: string | null;
  jalur: "ai_draf" | "bahas_tim";
  status: StatusDraf;
  catatan_tim?: string | null;
  created_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
}

export interface BotCodedFields {
  jenis_hambatan: JenisHambatan;
  jenis_hambatan_lain?: string | null;
  sering: SeringHambatan;
  saat_ketahuan: SaatKetahuan;
  niat_ubah: NiatUbah;
  tingkat: TingkatEskalasi;
  tingkat_alasan?: string | null;
  escalate_wa: boolean;
  action_kode?: string | null;
  ringkasan_lapangan: string;
}

export interface HasilPublik {
  yang_kebaca: string;
  cerita_aman: string;
  aksi: ActionItem[];
  tautan: { href: string; label: string }[];
  lampiran_skor: "terlihat" | "belum_terlihat";
}
