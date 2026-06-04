import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const COMPANIES = [
  {
    slug: 'otoro',
    code: 'OTORO',
    name: 'LEKKASJEJEGER PRO',
    not: 'en sensor',
    is: 'en komplett inspeksjonsrobot som selger seg selv til forsikring',
    color: '#00cfff',
    buyer: 'Forsikringsselskaper',
    pitch: 'De betaler 15 000 kr per leilighetsinspeksjon. Du selger maskinen for 180 000 kr. ROI etter 12 inspeksjoner.',
    model: 'B2B · CAPEX',
    stats: [
      { label: 'Maskinkostnad', value: '180 000 kr' },
      { label: 'Per inspeksjon', value: '15 000 kr' },
      { label: 'ROI-punkt', value: '12 jobber' },
      { label: 'Marked', value: 'Forsikring NO' },
    ],
  },
  {
    slug: 'grip',
    code: 'GRIP',
    name: 'KIRURG-TRENER',
    not: 'en leke-hanske',
    is: 'haptisk treningssimulator med reell vev-motstand',
    color: '#00e87f',
    buyer: 'Medisinstudier · Sykehus',
    pitch: 'Happenings selger liknende for 400 000 kr. Du bygger for 80 000 kr og selger for 200 000 kr — 60 % margin, halvparten av konkurrentprisen.',
    model: 'B2B · Hardware',
    stats: [
      { label: 'Salgspris', value: '200 000 kr' },
      { label: 'Produksjonskost', value: '80 000 kr' },
      { label: 'Bruttomargin', value: '60 %' },
      { label: 'Konkurrent', value: '400 000 kr' },
    ],
  },
  {
    slug: 'varde',
    code: 'VARDE',
    name: 'KATASTROFE-MESH',
    not: 'en stake',
    is: '50 solar-noder kastet fra helikopter som bygger internett over 100 km²',
    color: '#ff6a35',
    buyer: 'UNHCR · NATO · Sivilforsvaret',
    pitch: 'Etter jordskjelv, flom eller krig — kastes kassen ut fra helikopter og internett er oppe på minutter. Selges for 2 millioner per system.',
    model: 'B2G · System',
    stats: [
      { label: 'Systempris', value: '2 000 000 kr' },
      { label: 'Dekning', value: '100 km²' },
      { label: 'Noder', value: '50 per kasse' },
      { label: 'Deployment', value: 'Helikopter-drop' },
    ],
  },
  {
    slug: 'trygg',
    code: 'TRYGG',
    name: 'LIVSIGNAL-VAKT',
    not: 'en fallsensor',
    is: 'en radar som oppdager hjertestans 8 sekunder før personen kollapser',
    color: '#ff2d55',
    buyer: 'Sykehjem · Omsorgsboliger',
    pitch: 'Radar ser hjertet stoppe og varsler ambulanse automatisk. Subscription-modell: 800 kr/måned per beboer. 50 beboere = 40 000 kr/mnd.',
    model: 'SaaS · Subscription',
    stats: [
      { label: 'Månedspris', value: '800 kr/mnd' },
      { label: 'Per beboer', value: 'Ubegrenset rom' },
      { label: 'Varsling', value: '8 sek tidlig' },
      { label: 'Sensor', value: 'Radar · Ikke kamera' },
    ],
  },
  {
    slug: 'sverm',
    code: 'SVERM-VEVAR',
    name: 'BRANNMANN-KOFFERT',
    not: 'en lekekasse',
    is: '6 termiske droner som kartlegger aktive bygningsbranner og finner folk gjennom røyk',
    color: '#ffaa00',
    buyer: 'Brannvesen · 110-sentraler',
    pitch: '6 termiske droner tar av i sekunder, kartlegger hele bygget og pinger GPS-posisjon på alle varmekilder. 1,2 millioner per koffert.',
    model: 'B2G · Hardware',
    stats: [
      { label: 'Salgspris', value: '1 200 000 kr' },
      { label: 'Droner', value: '6 per koffert' },
      { label: 'Sensor', value: 'Termisk IR' },
      { label: 'Oppsett', value: '< 60 sekunder' },
    ],
  },
] as const;

type Company = (typeof COMPANIES)[number];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  return (
    <>
      <Head>
        <title>Fem Selskaper. Ikke Leker.</title>
        <meta name="description" content="Fem norske hardwareselskaper med dokumentert forretningsmodell og klar ROI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ background: '#040406', color: '#fff', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', overflowX: 'hidden' }}>

        {/* ── HERO ── */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          padding: '2rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 90% 55% at 50% -5%, #07112a 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(48px)',
            transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)',
            position: 'relative',
          }}>
            <p style={{ letterSpacing: '0.5em', fontSize: '0.65rem', color: '#4a4a5a', marginBottom: '3.5rem', textTransform: 'uppercase' }}>
              Norsk hardware &nbsp;·&nbsp; Klar forretningsmodell &nbsp;·&nbsp; Dokumentert ROI
            </p>

            <h1 style={{ fontSize: 'clamp(4.5rem, 16vw, 12rem)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
              FEM<br />
              <span style={{ WebkitTextStroke: '2px #1e1e30', color: 'transparent' }}>SEL</span>
              <span style={{ color: '#fff' }}>SKAPER</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 3.5vw, 2.8rem)', fontWeight: 200, letterSpacing: '0.3em', color: '#444', marginBottom: '5rem' }}>
              IKKE &nbsp;&nbsp; LEKER.
            </p>

            <nav aria-label="Selskaper" style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {COMPANIES.map((c) => (
                <a key={c.slug} href={`#${c.slug}`} style={{
                  padding: '0.55rem 1.4rem',
                  border: `1px solid ${c.color}28`,
                  borderRadius: '100px',
                  color: c.color,
                  background: `${c.color}0c`,
                  textDecoration: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  transition: 'background 0.15s, border-color 0.15s',
                }}>
                  {c.code}
                </a>
              ))}
            </nav>
          </div>

          <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#2a2a38', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Scroll</span>
            <div style={{ width: '1px', height: '52px', background: 'linear-gradient(#2a2a38, transparent)' }} />
          </div>
        </section>

        {/* ── COMPANY SECTIONS ── */}
        {COMPANIES.map((company, i) => (
          <CompanySection key={company.slug} company={company} index={i} />
        ))}

        {/* ── SUMMARY TABLE ── */}
        <SummarySection />

        {/* ── CTA ── */}
        <CtaSection />
      </div>
    </>
  );
}

function CompanySection({ company, index }: { company: Company; index: number }) {
  const { ref, visible } = useInView(0.12);
  const isEven = index % 2 === 0;

  return (
    <section
      id={company.slug}
      ref={ref}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: 'clamp(3rem, 8vw, 8rem) clamp(1.5rem, 6vw, 7rem)',
        borderTop: '1px solid #0c0c14', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 65% 85% at ${isEven ? '0%' : '100%'} 50%, ${company.color}06 0%, transparent 60%)`,
      }} />

      {/* Vertical index line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: isEven ? '3.5rem' : 'auto', right: isEven ? 'auto' : '3.5rem',
        width: '1px',
        background: `linear-gradient(to bottom, transparent, ${company.color}18, transparent)`,
        display: 'none',
      }} />

      <div style={{
        maxWidth: '1100px', margin: '0 auto', width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(56px)',
        transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative',
      }}>

        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.25rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.28em',
            color: company.color, background: `${company.color}13`,
            border: `1px solid ${company.color}22`, padding: '0.3rem 0.7rem',
            borderRadius: '4px', textTransform: 'uppercase',
          }}>
            {String(index + 1).padStart(2, '0')} / 05
          </span>
          <span style={{ color: '#3a3a4e', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{company.buyer}</span>
          <span style={{
            color: '#2a2a3a', fontSize: '0.6rem', letterSpacing: '0.12em',
            background: '#0e0e18', padding: '0.2rem 0.6rem', borderRadius: '3px',
          }}>{company.model}</span>
        </div>

        {/* Code + Name */}
        <p style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#333', marginBottom: '0.4rem', fontWeight: 600 }}>
          {company.code}
        </p>
        <h2 style={{ fontSize: 'clamp(2.5rem, 7.5vw, 6.5rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: '2rem', color: '#fff' }}>
          {company.name}
        </h2>

        {/* Pitch line */}
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.7rem)', marginBottom: '3rem', lineHeight: 1.45, maxWidth: '680px' }}>
          <span style={{ color: '#252530' }}>Ikke {company.not}.</span>
          {' '}
          <span style={{ color: '#c8c8d8' }}>En {company.is}.</span>
        </p>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
          gap: '1px',
          background: `${company.color}18`,
          borderRadius: '10px',
          overflow: 'hidden',
          maxWidth: '700px',
          marginBottom: '2.75rem',
          border: `1px solid ${company.color}1e`,
        }}>
          {company.stats.map((stat) => (
            <div key={stat.label} style={{ padding: '1.2rem 1.4rem', background: '#040406' }}>
              <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a3a4a', marginBottom: '0.45rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)', fontWeight: 700, color: company.color, fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Pitch paragraph */}
        <blockquote style={{ borderLeft: `2px solid ${company.color}40`, paddingLeft: '1.4rem', margin: 0, maxWidth: '540px' }}>
          <p style={{ fontSize: 'clamp(0.85rem, 1.4vw, 0.975rem)', color: '#5a5a70', lineHeight: 1.85, margin: 0 }}>
            {company.pitch}
          </p>
        </blockquote>

        {/* Deep-dive link */}
        <div style={{ marginTop: '2.5rem' }}>
          <Link href={`/selskap/${company.slug}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            color: company.color, textDecoration: 'none',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase',
            borderBottom: `1px solid ${company.color}30`,
            paddingBottom: '0.2rem',
            transition: 'border-color 0.15s',
          }}>
            Full pitch + ROI-kalkulator
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SummarySection() {
  const { ref, visible } = useInView(0.1);

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(4rem, 9vw, 9rem) clamp(1.5rem, 6vw, 7rem)',
        borderTop: '1px solid #0c0c14', background: '#020204',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Porteføljeoversikt
        </h2>
        <p style={{ color: '#3a3a4e', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Fem selskaper — én investordialog
        </p>

        <div style={{ overflowX: 'auto', marginRight: '-1.5rem', paddingRight: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
            <thead>
              <tr>
                {['', 'Produkt', 'Pris', 'Kjøper', 'Modell'].map((h) => (
                  <th key={h} style={{
                    padding: '0.75rem 1rem', textAlign: 'left',
                    fontSize: '0.58rem', letterSpacing: '0.22em',
                    textTransform: 'uppercase', color: '#353545', fontWeight: 600,
                    borderBottom: '1px solid #0e0e18',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((c) => (
                <tr key={c.slug} style={{ borderBottom: '1px solid #090910' }}>
                  <td style={{ padding: '1.1rem 1rem' }}>
                    <span style={{
                      display: 'inline-block', background: `${c.color}12`,
                      border: `1px solid ${c.color}22`, color: c.color,
                      borderRadius: '4px', padding: '0.2rem 0.55rem',
                      fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em',
                    }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding: '1.1rem 1rem', color: '#ddd', fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</td>
                  <td style={{ padding: '1.1rem 1rem', color: c.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>
                    {c.stats[0].value}
                  </td>
                  <td style={{ padding: '1.1rem 1rem', color: '#555', fontSize: '0.8rem' }}>{c.buyer}</td>
                  <td style={{ padding: '1.1rem 1rem' }}>
                    <span style={{ fontSize: '0.62rem', color: '#444', background: '#0d0d16', padding: '0.2rem 0.55rem', borderRadius: '3px', letterSpacing: '0.05em' }}>
                      {c.model}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { ref, visible } = useInView(0.15);

  return (
    <section ref={ref} style={{
      padding: 'clamp(6rem, 14vw, 14rem) clamp(1.5rem, 6vw, 7rem)',
      textAlign: 'center', borderTop: '1px solid #0c0c14',
      position: 'relative', overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% 110%, #080818 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.45em', color: '#333', marginBottom: '2rem', textTransform: 'uppercase' }}>
          Neste steg
        </p>
        <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '1.5rem', lineHeight: 1.05 }}>
          Fem selskaper.<br />
          <span style={{ color: '#1a1a26' }}>Én beslutning.</span>
        </h2>
        <p style={{ color: '#444', fontSize: '1rem', maxWidth: '420px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
          Alle konseptene er klare for investordialog, prototype og markedsvalidering i 2026.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {COMPANIES.map((c) => (
            <Link key={c.slug} href={`/selskap/${c.slug}`} style={{
              padding: '0.7rem 1.6rem', borderRadius: '8px',
              background: `${c.color}12`, border: `1px solid ${c.color}22`,
              color: c.color, textDecoration: 'none',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {c.code}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
