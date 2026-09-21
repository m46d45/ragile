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

Isi nilai dari **Vercel Dashboard → Storage → Postgres**:

- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

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
│   ├── page.tsx              # Landing Page
│   ├── diagnosa/page.tsx     # Halaman Diagnosa
│   ├── layout.tsx
│   └── globals.css
├── components/               # Komponen reusable
├── lib/
│   └── db.ts                 # Koneksi Vercel Postgres
├── types/
│   └── index.ts              # TypeScript types
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## Fitur MVP (Rencana)

- [x] Landing Page
- [x] Diagnosa (kerangka + branching)
- [ ] Knowledge Base
- [ ] Template & Tools
- [ ] Chatbot AI
- [ ] Daftar Member (form → database)
- [ ] Daftar Pakar
- [ ] Public / Private Q&A

---

## Catatan

- Blueprint lengkap tersedia di `Ragile_Blueprint.pdf`
- Schema database tersedia di `ragile_database_schema.sql`
- Semua konten dalam Bahasa Indonesia
- Mobile-first

---

© 2026 RagilE (Ragil Elektronic)
