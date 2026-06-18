import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Tet Studio — Paste-ready creative prompts in seconds",
    template: "%s · Tet Studio",
  },
  description:
    "Turn a few words into structured, mobile-ready prompts for photo, video, music, art and poetry. Built for creators who ship.",
  openGraph: {
    title: "Tet Studio",
    description:
      "Turn a few words into paste-ready creative prompts for photo, video, music, art and poetry.",
    type: "website",
  },
  metadataBase: new URL("https://tet.studio"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "oklch(0.55 0.24 300)" },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
