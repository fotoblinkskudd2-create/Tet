import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PerspectivePulse - Break Your Filter Bubble",
  description:
    "AI-powered news aggregator that presents every story from progressive, conservative, and international viewpoints to help you see the full picture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center px-4 mx-auto max-w-7xl">
            <Link href="/" className="flex items-center gap-2 mr-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PP</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline-block">
                PerspectivePulse
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Stories
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
