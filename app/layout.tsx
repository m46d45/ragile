import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RagilE — cerita lapangan untuk kontraktor kecil",
  description:
    "Kalau di lokasi sering nunggu orang atau alat, atau kerja harus dikerjakan ulang — cerita saja di sini. Nanti dibantu cari yang bisa dicoba minggu ini.",
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
