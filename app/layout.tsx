import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forbidden 2026",
  description: "Scaffolded Next.js app with Supabase helpers"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
