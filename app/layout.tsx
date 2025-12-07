import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DebattDome - AI-drevet gladiatorarena for argumentasjon',
  description: 'Strukturert debatt med AI-analyse av logikk og argumentasjon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
