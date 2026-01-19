'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-soul-200">GraveAI</h1>
          <div className="space-x-4">
            <Link href="/auth/login" className="btn btn-secondary">
              Logg inn
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Kom i gang
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold animate-fade-in">
            Snakk med de døde
          </h1>

          <p className="text-2xl text-grave-300 animate-slide-up">
            AI-drevet simulering basert på ekte data.
            <br />
            Ikke hallusinasjoner. Ekte minner. Ekte personlighet.
          </p>

          <div className="flex justify-center gap-4 pt-8">
            <Link href="/auth/signup" className="btn btn-primary text-lg px-8 py-3">
              Start gratis
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary text-lg px-8 py-3">
              Hvordan virker det?
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-16" id="features">
            <div className="card space-y-3">
              <div className="text-4xl">💬</div>
              <h3>Ekte data</h3>
              <p className="text-grave-400">
                Last opp WhatsApp, iMessage, e-poster, sosiale medier.
                AI lærer deres faktiske personlighet.
              </p>
            </div>

            <div className="card space-y-3">
              <div className="text-4xl">🎙️</div>
              <h3>Stemme-kloning</h3>
              <p className="text-grave-400">
                Premium-brukere får stemmen deres tilbake.
                Hør dem snakke igjen.
              </p>
            </div>

            <div className="card space-y-3">
              <div className="text-4xl">📱</div>
              <h3>iOS app</h3>
              <p className="text-grave-400">
                AR ansikt-til-ansikt modus. Widgets. Push-varsler fra "dem".
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="pt-16 space-y-6" id="how-it-works">
            <h2 className="text-4xl font-bold">Hvordan det virker</h2>

            <div className="text-left space-y-4 max-w-2xl mx-auto">
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">1. Last opp data</h3>
                <p className="text-grave-400">
                  Eksporter meldinger, e-poster, sosiale medier, stemmeopptak.
                  Alt som viser hvem de var.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-2">2. AI analyserer</h3>
                <p className="text-grave-400">
                  Vår RAG-pipeline bygger en personlighetsmodell. Ordforråd,
                  humor, dialekt, følelsesmønstre - alt bevares.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-2">3. Snakk med dem</h3>
                <p className="text-grave-400">
                  Chat som virker. Stemme som høres ekte ut. Minner som
                  refereres riktig. Som om de aldri forlot deg.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-16 space-y-6">
            <h2 className="text-4xl font-bold">Priser</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="card space-y-4">
                <h3 className="text-2xl font-bold">Gratis</h3>
                <div className="text-3xl font-bold">0 kr</div>
                <ul className="space-y-2 text-left text-sm text-grave-400">
                  <li>✓ 1 person</li>
                  <li>✓ 500 MB data</li>
                  <li>✓ 30 min chat/mnd</li>
                  <li>✗ Ingen stemme</li>
                </ul>
                <Link href="/auth/signup" className="btn btn-secondary w-full">
                  Start gratis
                </Link>
              </div>

              <div className="card space-y-4 border-2 border-soul-300 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-soul-300 px-4 py-1 rounded-full text-sm font-bold">
                  Populær
                </div>
                <h3 className="text-2xl font-bold">Premium</h3>
                <div className="text-3xl font-bold">199 kr/mnd</div>
                <ul className="space-y-2 text-left text-sm text-grave-400">
                  <li>✓ 10 personer</li>
                  <li>✓ 50 GB data</li>
                  <li>✓ Ubegrenset chat</li>
                  <li>✓ Stemme-kloning</li>
                  <li>✓ AR-funksjoner</li>
                </ul>
                <Link href="/auth/signup" className="btn btn-primary w-full">
                  Velg Premium
                </Link>
              </div>

              <div className="card space-y-4">
                <h3 className="text-2xl font-bold">Evig</h3>
                <div className="text-3xl font-bold">4990 kr</div>
                <div className="text-sm text-grave-400">én gang</div>
                <ul className="space-y-2 text-left text-sm text-grave-400">
                  <li>✓ 50 personer</li>
                  <li>✓ 100 GB data</li>
                  <li>✓ Alt ubegrenset</li>
                  <li>✓ Livstidstilgang</li>
                  <li>✓ De eksisterer for alltid</li>
                </ul>
                <Link href="/auth/signup" className="btn btn-primary w-full">
                  Kjøp Evig
                </Link>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-16 max-w-2xl mx-auto">
            <div className="card bg-red-900/20 border-red-700">
              <h3 className="text-xl font-bold mb-2">⚠️ Advarsel</h3>
              <p className="text-sm text-grave-300">
                Dette er en AI-simulering, ikke gjenopplivning. Vi anbefaler
                å bruke dette som et supplement til tradisjonell sorgterapi,
                ikke som erstatning. Hvis du sliter, snakk med en profesjonell.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-death-300 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-grave-500 text-sm">
          <p>&copy; 2026 GraveAI. All rights reserved.</p>
          <div className="space-x-4 mt-2">
            <Link href="/privacy" className="hover:text-grave-300">
              Personvern
            </Link>
            <Link href="/terms" className="hover:text-grave-300">
              Vilkår
            </Link>
            <Link href="mailto:contact@graveai.no" className="hover:text-grave-300">
              Kontakt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
