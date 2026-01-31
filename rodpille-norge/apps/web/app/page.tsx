import { Suspense } from 'react'
import { Feed } from '@/components/feed'
import { FeedSkeleton } from '@/components/feed/skeleton'
import { DonationProgress } from '@/components/donation-progress'
import { TrendingTags } from '@/components/trending-tags'
import { DailySummaryCard } from '@/components/daily-summary-card'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1
          className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 glitch"
          data-text="VÅKN OPP NORGE"
        >
          <span className="text-gradient-red">VÅKN OPP</span> NORGE
        </h1>
        <p className="text-xl text-pille-muted max-w-2xl mx-auto">
          Sannheten NRK ikke viser deg. Strømtyveri. Innvandringskostnader. Elitekorrupsjon.
        </p>
      </div>

      {/* Donation Progress */}
      <div className="mb-8">
        <DonationProgress />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Left */}
        <div className="lg:col-span-1 space-y-6">
          <TrendingTags />

          <div className="card-brutal p-4">
            <h3 className="font-bold text-rod-400 mb-3">KILDER</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://document.no" target="_blank" className="hover:text-rod-400 transition-colors">
                  Document.no
                </a>
              </li>
              <li>
                <a href="https://resett.no" target="_blank" className="hover:text-rod-400 transition-colors">
                  Resett
                </a>
              </li>
              <li>
                <a href="https://rights.no" target="_blank" className="hover:text-rod-400 transition-colors">
                  Rights.no
                </a>
              </li>
              <li>
                <a href="https://steigan.no" target="_blank" className="hover:text-rod-400 transition-colors">
                  Steigan.no
                </a>
              </li>
            </ul>
          </div>

          <div className="card-brutal p-4">
            <h3 className="font-bold text-rod-400 mb-3">STATISTIKK</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-pille-muted">Løgner avslørt:</span>
                <span className="text-rod-400">1,337</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pille-muted">Rød-pillede:</span>
                <span className="text-green-400">42,069</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pille-muted">Shills bannet:</span>
                <span className="text-orange-400">666</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2">
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        </div>

        {/* Sidebar - Right */}
        <div className="lg:col-span-1 space-y-6">
          <DailySummaryCard />

          <div className="card-brutal p-4">
            <h3 className="font-bold text-rod-400 mb-3">RØD PILLE ELITE</h3>
            <p className="text-sm text-pille-muted mb-4">
              99 kr/mnd for ad-free, prioritet i feed, og eksklusive AI-rapporter.
            </p>
            <a href="/subscribe" className="btn-brutal w-full text-center block">
              BLI ELITE
            </a>
          </div>

          <div className="card-brutal p-4">
            <h3 className="font-bold text-rod-400 mb-3">DEL SANNHETEN</h3>
            <p className="text-sm text-pille-muted mb-4">
              Post til X med ett klikk. Spre den røde pillen.
            </p>
            <a
              href="https://twitter.com/intent/tweet?text=Norge%20v%C3%A5kner!%20%F0%9F%94%B4%20%23R%C3%B8dPilleNorge"
              target="_blank"
              className="btn-brutal-outline w-full text-center block"
            >
              POST TIL X
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
