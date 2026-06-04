import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const COMPANIES = [
  {
    slug: 'otoro',
    code: 'OTORO',
    name: 'Lekkasjejeger Pro',
    emoji: '💧',
    hook: 'Finn vannlekkasjer før de blir katastrofe',
    for: 'For forsikringsselskaper',
    value: 'Roboten gjør på 45 min det en inspektør bruker en dag på — og leverer digital rapport automatisk.',
    color: '#0A84FF',
    light: '#E3F2FF',
    price: '180 000 kr',
    model: 'ROI på 12 jobber',
  },
  {
    slug: 'grip',
    code: 'GRIP',
    name: 'Kirurg-Trener',
    emoji: '🫀',
    hook: 'Tren kirurgi som om du holder i ekte vev',
    for: 'For medisinstudier og sykehus',
    value: 'Halvparten av konkurrentprisen. Haptisk hanske som simulerer motstand i bløtvev, bindevev og organer.',
    color: '#30D158',
    light: '#E6F9EC',
    price: '200 000 kr',
    model: '60% margin · Innholdsabonnement',
  },
  {
    slug: 'varde',
    code: 'VARDE',
    name: 'Katastrofe-Mesh',
    emoji: '📡',
    hook: 'Internett over 100 km² — kastet fra helikopter',
    for: 'For UNHCR, NATO og Sivilforsvaret',
    value: '50 solar-noder faller til bakken og snakker med hverandre. 20 minutter etter katastrofen er internett oppe.',
    color: '#FF9F0A',
    light: '#FFF4E0',
    price: '2 000 000 kr',
    model: 'B2G · Systemkontrakt',
  },
  {
    slug: 'trygg',
    code: 'TRYGG',
    name: 'Livsignal-Vakt',
    emoji: '❤️',
    hook: 'Vet at hjertet stopper — 8 sekunder før personen faller',
    for: 'For sykehjem og omsorgsboliger',
    value: 'Radar (ikke kamera) ser hjertet stoppe og varsler ambulanse mens personen fortsatt står. Ingen inngripen i privatlivet.',
    color: '#FF375F',
    light: '#FFE6EC',
    price: '800 kr / beboer / mnd',
    model: 'Subscription · Ingen CAPEX',
  },
  {
    slug: 'sverm',
    code: 'SVERM-VEVAR',
    name: 'Brannmann-Koffert',
    emoji: '🔥',
    hook: 'Se gjennom røyk. Finn folk. På 60 sekunder.',
    for: 'For brannvesen og 110-sentraler',
    value: '6 termiske droner letter fra kofferten, sprer seg i bygget og sender kart med alle varmekilder direkte til sjefens nettbrett.',
    color: '#FF6B00',
    light: '#FFF0E6',
    price: '1 200 000 kr',
    model: 'B2G · Servicekontrakt',
  },
];

export default function HomePage() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Fem produkter. Ekte verdi.</title>
        <meta name="description" content="Norske hardwareprosjekter som løser reelle problemer for forsikring, helsevesen, katastrofehjelp og sikkerhet." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <div style={{
        background: '#000',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}>

        {/* ── TOP BAR ── */}
        <div style={{
          padding: 'env(safe-area-inset-top, 0) 20px 0',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>Fem Selskaper</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>IKKE LEKER</span>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 64, paddingBottom: 48, textAlign: 'center' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.06)',
              borderRadius: 100, padding: '6px 16px', marginBottom: 24,
              fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px',
            }}>
              Norsk hardware · Klar forretningsmodell
            </div>

            <h1 style={{
              fontSize: 'clamp(38px, 10vw, 72px)',
              fontWeight: 700, lineHeight: 1.05,
              letterSpacing: '-1.5px', marginBottom: 20,
            }}>
              Produkter som<br />
              <span style={{ color: 'rgba(255,255,255,0.28)' }}>faktisk hjelper.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 4vw, 19px)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6, maxWidth: 480,
              margin: '0 auto',
            }}>
              Fem hardwareprosjekter bygget for å løse ekte problemer — for forsikring, helsevesen, katastrofehjelp og sikkerhet.
            </p>
          </div>

          {/* ── COMPANY CARDS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 100 }}>
            {COMPANIES.map((c) => (
              <CompanyCard
                key={c.slug}
                company={c}
                expanded={activeCard === c.slug}
                onToggle={() => setActiveCard((prev) => (prev === c.slug ? null : c.slug))}
              />
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.95) 30%)',
          padding: '40px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
            Trykk på et selskap for mer info
          </p>
        </div>
      </div>
    </>
  );
}

interface Company {
  slug: string;
  code: string;
  name: string;
  emoji: string;
  hook: string;
  for: string;
  value: string;
  color: string;
  light: string;
  price: string;
  model: string;
}

function CompanyCard({ company: c, expanded, onToggle }: {
  company: Company;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: expanded ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: expanded ? `1px solid ${c.color}40` : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '20px 20px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${c.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
          border: `1px solid ${c.color}25`,
        }}>
          {c.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px' }}>{c.name}</span>
            <span style={{
              fontSize: 11, color: c.color, fontWeight: 700,
              background: `${c.color}18`, borderRadius: 6,
              padding: '2px 7px', letterSpacing: '0.3px',
            }}>
              {c.code}
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.4 }}>
            {c.hook}
          </p>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }}>
          ▾
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
          {/* For who */}
          <div style={{
            display: 'inline-block', fontSize: 12, fontWeight: 600,
            color: c.color, background: `${c.color}15`,
            borderRadius: 8, padding: '4px 10px', marginBottom: 12,
            letterSpacing: '0.2px',
          }}>
            {c.for}
          </div>

          {/* Value prop */}
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, marginBottom: 20 }}>
            {c.value}
          </p>

          {/* Price + model tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 10,
              padding: '8px 14px',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Pris</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.color }}>{c.price}</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 10,
              padding: '8px 14px',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Modell</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{c.model}</div>
            </div>
          </div>

          {/* CTA button */}
          <Link
            href={`/selskap/${c.slug}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, background: c.color, color: '#000',
              borderRadius: 14, padding: '14px 20px',
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
              letterSpacing: '-0.2px',
            }}
          >
            Se full pitch og ROI-kalkulator
            <span style={{ fontSize: 16 }}>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
