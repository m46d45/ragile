import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ragile — Klinik Cara Kerja untuk Kontraktor Kecil",
  description:
    "Ragile membantu kontraktor kecil memperbaiki metode kerja, manajemen proyek, dan produksi di lapangan. Diagnosa gratis, template siap pakai, dan dukungan praktis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
