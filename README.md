# RagilE

Cerita lapangan untuk kontraktor kecil. Kalau di lokasi sering nunggu orang atau alat, atau kerja harus dikerjakan ulang — cerita saja di sini.

**Publik:** RagilE · **Slug:** ragile · **Live:** https://ragile.vercel.app  
**Footer:** RagilE · CIBE FTSL ITB

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** file store prototype; Vercel Postgres (Neon) opsional
- **Deploy:** Vercel

---

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

Kunci opsional:

- `AI_API_KEY`, `AI_API_BASE`, `AI_MODEL` — tanya singkat / draf WA
- `POSTGRES_URL` — jika DB sudah siap (lihat `ragile_database_schema.sql`)
- `INTERNAL_PASS` — kunci `/internal/*` (kosong = terbuka di prototype)

Migrasi kolom lama `jenis_macet` → `jenis_hambatan`: `ragile_migrate_jenis_hambatan.sql`.

---

## Publik (tanpa login)

- Landing — bio lapangan, bukan marketing efisien / daftar member
- FAQ — 3 Q terkunci (bayar / bos / daftar) + yang sudah ditinjau
- Tanya singkat — berpijak FAQ + aksi
- Cek singkat (`/diagnosa`) — nunggu orang/alat vs kerja diulang → 4 blok hasil
- Aksi 1–5 (`/aksi/...`) — tanpa kode L0 di muka

## Internal

- `/internal/antrian` — tempel WA, draf, **usul → OK Abduh → terkirim** (salin manual, tidak auto-kirim). Referral opsional: dari Pak/Bu X. Tingkat L0–L3.
- `/internal/faq` — calon → tinjau → terbit
- `/internal/kajian` — L2/L3
- `/internal/riset` — ekspor `izin_anonim=ya`, field `jenis_hambatan`

Bank internal boleh pakai L0-01…05. UI publik: nunggu / diulang / mandor / berangkat.

---

© 2026 RagilE (Ragil Electronic)
