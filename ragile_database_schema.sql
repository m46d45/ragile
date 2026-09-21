-- RagilE (Ragil Electronic) — skema v1 + F0
-- Identitas terpisah dari ekspor riset.
-- Setiap masalah tetap masuk problem_bank, termasuk jika izin ditolak.

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  contractor_qualification TEXT,
  main_field TEXT,
  whatsapp TEXT,
  email TEXT,
  preferred_channel TEXT NOT NULL DEFAULT 'whatsapp',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  pertanyaan TEXT NOT NULL,
  jawaban TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  urutan INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  asal TEXT NOT NULL DEFAULT 'seed' CHECK (asal IN ('seed', 'usulan')),
  kali_dipakai INTEGER NOT NULL DEFAULT 0,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS action_bank (
  id UUID PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  nomor INTEGER NOT NULL DEFAULT 0,
  slug TEXT NOT NULL UNIQUE,
  judul TEXT NOT NULL,
  isi_mandor TEXT NOT NULL,
  file_url TEXT,
  jenis_hambatan TEXT[] NOT NULL DEFAULT '{}',
  tingkat TEXT NOT NULL DEFAULT 'L0',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members (id),
  session_id TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('web', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations (id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_bank (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sumber_masuk TEXT NOT NULL CHECK (
    sumber_masuk IN (
      'referral', 'IAMKRI', 'WA_langsung', 'event', 'web_bot', 'diagnosa', 'lain'
    )
  ),
  channel TEXT NOT NULL CHECK (channel IN ('web', 'whatsapp', 'event', 'lain')),
  jenis_hambatan TEXT NOT NULL CHECK (
    jenis_hambatan IN (
      'nunggu_orang', 'nunggu_alat', 'ulang_kerja',
      'info_salah_terlambat', 'nunggu_serah_terima', 'lain'
    )
  ),
  jenis_hambatan_lain TEXT,
  sering TEXT NOT NULL CHECK (sering IN ('sering', 'sekali_sekali', 'belum_jelas')),
  saat_ketahuan TEXT NOT NULL CHECK (
    saat_ketahuan IN ('pagi', 'tengah_hari', 'menjelang_selesai', 'belum_jelas')
  ),
  niat_ubah TEXT NOT NULL CHECK (
    niat_ubah IN ('mau_ubah', 'cerita_dulu', 'belum_ditanya')
  ),
  tingkat TEXT NOT NULL CHECK (tingkat IN ('L0', 'L1', 'L2', 'L3')),
  tingkat_alasan TEXT,
  ringkasan_lapangan TEXT NOT NULL,
  cerita_mentah TEXT NOT NULL,
  lokasi_umum TEXT,
  jenis_proyek TEXT,
  status_alur TEXT NOT NULL CHECK (
    status_alur IN (
      'masuk', 'draf_ai', 'bahas_tim', 'menunggu_ok', 'terkirim',
      'kajian', 'siap_konsultansi', 'konsultansi', 'ditutup'
    )
  ),
  jalur_wa TEXT NOT NULL CHECK (
    jalur_wa IN ('ai_draf', 'bahas_tim', 'tidak_berlaku')
  ),
  action_kode TEXT,
  tip_diterapkan BOOLEAN,
  izin_anonim TEXT NOT NULL DEFAULT 'belum_ditanya' CHECK (
    izin_anonim IN ('ya', 'tidak', 'belum_ditanya')
  ),
  izin_ditanya_at TIMESTAMPTZ,
  catatan_kajian TEXT,
  pola_berulang BOOLEAN NOT NULL DEFAULT FALSE,
  lintas_lokasi BOOLEAN NOT NULL DEFAULT FALSE,
  lintas_orang BOOLEAN NOT NULL DEFAULT FALSE,
  siap_konsultansi BOOLEAN NOT NULL DEFAULT FALSE,
  member_id UUID REFERENCES members (id),
  conversation_id UUID REFERENCES conversations (id),
  coded_by TEXT NOT NULL CHECK (coded_by IN ('ai', 'tim')),
  reviewed_at TIMESTAMPTZ,
  referral_dari TEXT,
  lampiran_skor TEXT NOT NULL DEFAULT 'belum_terlihat' CHECK (
    lampiran_skor IN ('terlihat', 'belum_terlihat')
  )
);

CREATE INDEX IF NOT EXISTS problem_bank_tingkat_idx ON problem_bank (tingkat);
CREATE INDEX IF NOT EXISTS problem_bank_status_idx ON problem_bank (status_alur);
CREATE INDEX IF NOT EXISTS problem_bank_izin_idx ON problem_bank (izin_anonim);
CREATE INDEX IF NOT EXISTS problem_bank_jenis_idx ON problem_bank (jenis_hambatan);

CREATE TABLE IF NOT EXISTS faq_usulan (
  id UUID PRIMARY KEY,
  pertanyaan_mentah TEXT NOT NULL,
  ringkasan TEXT,
  sumber TEXT NOT NULL CHECK (sumber IN ('web_bot', 'whatsapp', 'manual')),
  problem_id UUID REFERENCES problem_bank (id),
  status TEXT NOT NULL CHECK (
    status IN ('calon', 'ditinjau', 'jadi_faq', 'digabung', 'ditolak')
  ),
  mirip_faq_id UUID REFERENCES faq_items (id),
  faq_id UUID REFERENCES faq_items (id),
  kali_muncul INTEGER NOT NULL DEFAULT 1,
  contoh_teks TEXT[] NOT NULL DEFAULT '{}',
  catatan_tim TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wa_drafts (
  id UUID PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES problem_bank (id),
  conversation_id UUID REFERENCES conversations (id),
  teks_masuk TEXT NOT NULL,
  draf_ai TEXT,
  draf_final TEXT,
  jalur TEXT NOT NULL CHECK (jalur IN ('ai_draf', 'bahas_tim')),
  status TEXT NOT NULL CHECK (
    status IN ('usul', 'ok_abduh', 'terkirim')
  ),
  catatan_tim TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  decided_by TEXT
);

CREATE OR REPLACE VIEW problem_bank_riset AS
SELECT
  id,
  created_at,
  sumber_masuk,
  channel,
  jenis_hambatan,
  jenis_hambatan_lain,
  sering,
  saat_ketahuan,
  niat_ubah,
  tingkat,
  tingkat_alasan,
  ringkasan_lapangan,
  lokasi_umum,
  jenis_proyek,
  status_alur,
  action_kode,
  tip_diterapkan,
  pola_berulang,
  lintas_lokasi,
  lintas_orang,
  referral_dari
FROM problem_bank
WHERE izin_anonim = 'ya';
