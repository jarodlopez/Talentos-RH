import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talentos-RH — Talent Pool & Recruitment",
  description:
    "Crea tu Master Profile una vez y aplica a vacantes con evaluación instantánea por IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
