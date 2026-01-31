import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'RødPilleNorge - Våkn Opp',
  description: 'Sannheten om Norge som NRK ikke viser deg. Strømtyveri, innvandringskostnader, elitekorrupsjon.',
  keywords: ['norge', 'sannhet', 'nyheter', 'alternativ media', 'faktasjekk'],
  authors: [{ name: 'RødPilleNorge' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-brutal bg-pille-bg text-white antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-pille-border py-8 px-4">
              <div className="max-w-7xl mx-auto text-center text-pille-muted text-sm">
                <p>RødPilleNorge - Sannheten frigjør</p>
                <p className="mt-2">Ikke sponset av staten. Ikke sensurert av NRK.</p>
              </div>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
