import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { VibeProvider } from "@/context/vibe-context";
import { FontLoader } from "@/components/font-loader";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <VibeProvider>
          <FontLoader />
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
