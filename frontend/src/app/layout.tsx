import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GraveAI - Talk to the Dead',
  description: 'AI-powered deceased person simulation using real data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="bg-death-200 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
