import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPENALEX — Multi-Agent Orchestrator",
  description: "Build, run, and debug multi-agent AI workflows visually.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
