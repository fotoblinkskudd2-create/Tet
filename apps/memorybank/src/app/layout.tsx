import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEMORYBANK",
  description: "Your knowledge graph. Every thought connected.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
