import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GONZO JOURNAL",
  description: "Skriv rått. Skriv ærleg. Bli bedre.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
