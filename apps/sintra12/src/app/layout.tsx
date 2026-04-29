import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SINTRA12",
  description: "Products for the unhinged.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
