import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { VibeProvider } from "@/context/vibe-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeForge — The Ultimate Vibe Coding Studio",
  description:
    "Describe your app idea + vibe, and VibeForge generates a complete production-ready project. Powered by AI.",
  keywords: ["vibe coding", "AI code generation", "Next.js", "app builder"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Noto+Serif:wght@400;700&family=Space+Mono:wght@400;700&family=VT323&family=Playfair+Display:wght@400;700&family=Fira+Code:wght@400;700&family=Quicksand:wght@400;700&family=Orbitron:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VibeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--vf-card)",
                color: "var(--vf-fg)",
                border: `1px solid var(--vf-border)`,
              },
            }}
          />
        </VibeProvider>
      </body>
    </html>
  );
}
