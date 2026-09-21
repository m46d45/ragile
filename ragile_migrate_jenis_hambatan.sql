-- Migrasi F0: jenis_macet → jenis_hambatan + status usul/ok_abduh/terkirim
-- Aman dijalankan ulang (IF EXISTS / exception diabaikan lewat DO block).

ALTER TABLE action_bank ADD COLUMN IF NOT EXISTS nomor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE action_bank ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE action_bank ADD COLUMN IF NOT EXISTS jenis_hambatan TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_bank' AND column_name = 'jenis_macet'
  ) THEN
    UPDATE action_bank
    SET jenis_hambatan = ARRAY(
      SELECT CASE
        WHEN x = 'tunggu_orang' THEN 'nunggu_orang'
        WHEN x = 'tunggu_alat' THEN 'nunggu_alat'
        ELSE x
      END
      FROM unnest(jenis_macet) AS x
    )
    WHERE coalesce(array_length(jenis_hambatan, 1), 0) = 0;
    ALTER TABLE action_bank DROP COLUMN jenis_macet;
  END IF;
END $$;

ALTER TABLE faq_items ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE problem_bank ADD COLUMN IF NOT EXISTS jenis_hambatan TEXT;
ALTER TABLE problem_bank ADD COLUMN IF NOT EXISTS jenis_hambatan_lain TEXT;
ALTER TABLE problem_bank ADD COLUMN IF NOT EXISTS referral_dari TEXT;
ALTER TABLE problem_bank ADD COLUMN IF NOT EXISTS lampiran_skor TEXT NOT NULL DEFAULT 'belum_terlihat';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'problem_bank' AND column_name = 'jenis_macet'
  ) THEN
    UPDATE problem_bank SET jenis_hambatan = CASE jenis_macet
      WHEN 'tunggu_orang' THEN 'nunggu_orang'
      WHEN 'tunggu_alat' THEN 'nunggu_alat'
      ELSE jenis_macet
    END
    WHERE jenis_hambatan IS NULL;
    UPDATE problem_bank SET jenis_hambatan_lain = jenis_macet_lain
    WHERE jenis_hambatan_lain IS NULL;
    ALTER TABLE problem_bank DROP COLUMN jenis_macet;
    ALTER TABLE problem_bank DROP COLUMN jenis_macet_lain;
  END IF;
END $$;

UPDATE problem_bank SET jenis_hambatan = 'lain' WHERE jenis_hambatan IS NULL;
ALTER TABLE problem_bank ALTER COLUMN jenis_hambatan SET NOT NULL;

UPDATE wa_drafts SET status = CASE
  WHEN status IN ('disetujui') THEN 'ok_abduh'
  WHEN status IN ('terkirim') THEN 'terkirim'
  ELSE 'usul'
END
WHERE status NOT IN ('usul', 'ok_abduh', 'terkirim');

DROP VIEW IF EXISTS problem_bank_riset;
CREATE VIEW problem_bank_riset AS
SELECT
  id, created_at, sumber_masuk, channel,
  jenis_hambatan, jenis_hambatan_lain,
  sering, saat_ketahuan, niat_ubah, tingkat, tingkat_alasan,
  ringkasan_lapangan, lokasi_umum, jenis_proyek, status_alur,
  action_kode, tip_diterapkan, pola_berulang, lintas_lokasi, lintas_orang,
  referral_dari
FROM problem_bank
WHERE izin_anonim = 'ya';
