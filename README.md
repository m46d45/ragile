# RagilE — Ragil Elektronic

Klinik digital metode kerja, manajemen proyek, dan manajemen produksi untuk kontraktor kecil.

**Domain:** ragile.id  
**Versi:** 0.1.0 (MVP Starter)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Vercel Postgres (Neon)
- **Deploy:** Vercel

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ragile
npm install
```

### 2. Setup Environment

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi nilai dari **Vercel Dashboard → Storage → Postgres** (opsional di prototype) dan kunci AI:

- `AI_API_KEY`, `AI_API_BASE`, `AI_MODEL` — bot / draf WA
- `POSTGRES_URL` (dan variabel Neon/Vercel lain) — jika DB sudah siap
- `INTERNAL_PASS` — kunci halaman `/internal/*` (kosong = terbuka di prototype)

### 3. Setup Database

Jalankan schema SQL yang ada di file `ragile_database_schema.sql` (tersedia di folder artifacts project) melalui Vercel Postgres Query interface atau Neon Console.

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Struktur Folder

```
ragile/
├── app/
│   ├── page.tsx
│   ├── faq/ page.tsx
│   ├── tanya/ page.tsx
│   ├── diagnosa/ page.tsx
│   ├── internal/ antrian, kajian, riset
│   └── api/ bot + internal
├── components/
├── data/ faq.json, action_bank.json
├── lib/ clinic, ai, store
├── types/index.ts
├── ragile_database_schema.sql
└── .env.example
```

---

## Lapisan layanan

1. **Umum (tanpa login)** — [FAQ](/faq) + bot minimal [Tanya](/tanya) (AI API jika `AI_API_KEY` ada; kalau tidak, jawab dari FAQ/tip). FAQ awal hanya benih: pertanyaan baru yang belum pas masuk calon di `/internal/faq`, baru terbit setelah ditinjau.
2. **WhatsApp asinkron** — tidak auto-balas. `/internal/antrian`: tempel WA → draf AI **atau** bahas tim → Anda setujui → salin manual.
3. **Kajian → konsultansi** — L2/L3 atau yang dinaikkan masuk `/internal/kajian`. Dikaji dulu, baru konsultansi.
4. **Riset** — setiap masalah masuk `problem_bank` (kode: jenis macet, sering, saat, tingkat, alur). Identitas/WA terpisah. Ekspor hanya `izin_anonim=ya` di `/internal/riset`.

## Fitur MVP

- [x] Landing Page
- [x] Diagnosa (kerangka + branching)
- [x] FAQ publik + mekanisme tumbuh (calon → tinjau → terbit)
- [x] Bot minimal (AI API + fallback FAQ)
- [x] Antrian WA (draf AI / bahas tim / OK manual)
- [x] Kajian L2–L3 lalu konsultansi
- [x] Problem bank terstruktur + ekspor riset
- [ ] Template file unduhan
- [ ] WA Business API (Tahap 2)
- [ ] Daftar Member (form → database)

---

## Catatan

- Blueprint lengkap tersedia di `Ragile_Blueprint.pdf`
- Schema database tersedia di `ragile_database_schema.sql`
- Semua konten dalam Bahasa Indonesia
- Mobile-first

---

© 2026 RagilE (Ragil Elektronic)
