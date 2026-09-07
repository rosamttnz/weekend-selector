import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekend Selector",
  description: "Encuentra el mejor fin de semana para tu grupo"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
