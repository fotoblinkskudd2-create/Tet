import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "U-864 TRACKER",
  description: "Real-time tungmetall-overvåking. Fedje, Norge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
