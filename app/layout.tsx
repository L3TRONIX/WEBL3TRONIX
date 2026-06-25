import type { Metadata } from "next";
import { LanguageProvider } from "../context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "L3TRONIX — Para Nosotros, Jugadores.",
  description: "Join the Hive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
