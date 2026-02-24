"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl text-primary-700">LeanLife</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-slate-600 hover:text-slate-800 font-medium"
          >
            Logg inn
          </Link>
          <Link
            href="/register"
            className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition"
          >
            Kom i gang gratis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            Din personlige vei til{" "}
            <span className="text-primary-500">varig, sunn vekt</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            LeanLife kombinerer AI-drevet kaloritracking, personlige
            måltidsplaner og motivasjonscoaching — bygget på vitenskap, ikke
            skam.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-primary-600 transition shadow-lg shadow-primary-200"
            >
              Start gratis
            </Link>
            <a
              href="#features"
              className="border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold text-lg hover:border-slate-300 transition"
            >
              Se funksjoner
            </a>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🍎"
            title="Smart kaloritracking"
            description="Søk, skann strekkode eller ta bilde av maten. AI gjenkjenner og logger for deg."
          />
          <FeatureCard
            icon="📋"
            title="Personlige måltidsplaner"
            description="AI-genererte ukeplaner tilpasset dine mål, preferanser og budsjett."
          />
          <FeatureCard
            icon="📊"
            title="Vektgraf og trender"
            description="Se fremgangen din over tid. Trendanalyse filtrerer bort daglige svingninger."
          />
          <FeatureCard
            icon="🏋️"
            title="Treningsforslag"
            description="Treningsøkter tilpasset ditt nivå — fra gåturer til HIIT."
          />
          <FeatureCard
            icon="🔥"
            title="Streaks og motivasjon"
            description="Daglige påminnelser, badges og streaks som holder deg på sporet."
          />
          <FeatureCard
            icon="🔒"
            title="Privat og trygt"
            description="Dine data er dine. GDPR-compliant, kryptert og aldri solgt."
          />
        </section>

        {/* Pricing */}
        <section className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            Enkel prising
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <PriceCard
              name="Free"
              price="0 kr"
              period=""
              features={[
                "Kalorilogging",
                "Vektlogg",
                "Grunnleggende dashboard",
              ]}
            />
            <PriceCard
              name="Pro"
              price="79 kr"
              period="/mnd"
              features={[
                "Alt i Free",
                "AI-måltidsplaner",
                "Foto-logging",
                "Treningsforslag",
                "Eksport til lege",
              ]}
              highlighted
            />
            <PriceCard
              name="Familie"
              price="129 kr"
              period="/mnd"
              features={[
                "Alt i Pro",
                "4 familiemedlemmer",
                "Delte måltidsplaner",
                "Prioritert support",
              ]}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>&copy; 2026 LeanLife. Alle rettigheter forbeholdt.</p>
          <p className="mt-2">
            LeanLife erstatter ikke medisinsk rådgivning. Kontakt lege ved
            helsebekymringer.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary-200 hover:shadow-lg transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function PriceCard({
  name,
  price,
  period,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border-2 ${
        highlighted
          ? "border-primary-500 bg-primary-50 shadow-lg"
          : "border-slate-100"
      }`}
    >
      <h3 className="font-semibold text-lg mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <span className="text-primary-500">✓</span> {f}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block text-center py-2 rounded-lg font-medium transition ${
          highlighted
            ? "bg-primary-500 text-white hover:bg-primary-600"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {highlighted ? "Start Pro" : "Kom i gang"}
      </Link>
    </div>
  );
}
