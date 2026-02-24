import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeanLife — Din personlige vei til varig, sunn vekt",
  description:
    "AI-drevet vekthåndtering med kaloritracking, personlige måltidsplaner og motivasjonscoaching.",
  openGraph: {
    title: "LeanLife",
    description: "Smart vekthåndtering med AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
