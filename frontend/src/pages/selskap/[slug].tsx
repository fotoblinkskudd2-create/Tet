import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';

interface StatItem { label: string; value: string; }
interface TimelineItem { phase: string; duration: string; description: string; }

interface CompanyData {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  color: string;
  buyer: string;
  model: string;
  problem: string;
  solution: string;
  why: string;
  stats: StatItem[];
  businessModel: {
    title: string;
    description: string;
    lines: string[];
  };
  roi: {
    type: 'capex' | 'subscription' | 'margin';
    description: string;
    inputs: Array<{ id: string; label: string; unit: string; default: number; min: number; max: number; step: number }>;
    formula: (vals: Record<string, number>) => Array<{ label: string; value: string; highlight?: boolean }>;
  };
  timeline: TimelineItem[];
}

const COMPANIES: Record<string, CompanyData> = {
  otoro: {
    slug: 'otoro',
    code: 'OTORO',
    name: 'LEKKASJEJEGER PRO',
    tagline: 'Ikke en sensor. En komplett inspeksjonsrobot.',
    color: '#00cfff',
    buyer: 'Forsikringsselskaper',
    model: 'B2B · CAPEX',
    problem: 'Forsikringsselskaper bruker millioner på å betale ut skader for vannskader som kunne vært oppdaget måneder tidligere. Manuelle inspeksjoner er dyre, upålitelige og skalerer ikke.',
    solution: 'LEKKASJEJEGER PRO er en autonom robot som kjøres gjennom leilighetsbygg og detekterer fuktighet, trykkfall og rørsår med høyere presisjon enn menneskelig inspeksjon — og genererer forsikringsrapport automatisk.',
    why: 'Forsikringsselskaper betaler allerede 15 000 kr per manuell inspeksjon. Roboten gjør samme jobb på 45 minutter, med digital rapport, og selger seg selv etter 12 oppdrag.',
    stats: [
      { label: 'Salgspris', value: '180 000 kr' },
      { label: 'Per inspeksjon (markedspris)', value: '15 000 kr' },
      { label: 'ROI ved', value: '12 inspeksjoner' },
      { label: 'Inspeksjonstid', value: '~45 min/bygg' },
    ],
    businessModel: {
      title: 'Direkte maskinssalg + servicekontrakt',
      description: 'Selg roboten til forsikringsselskapet. De bruker den på sin portefølje av bygg. Du selger også servicekontrakt (20 000 kr/år) for programvareoppdateringer og kalibrering.',
      lines: [
        'Maskinpris: 180 000 kr',
        'Servicekontrakt: 20 000 kr / år',
        'Etter år 2: ren lisens + service',
        'Mål: 10 selskaper × 2 roboter = 3,6 MNOK år 1',
      ],
    },
    roi: {
      type: 'capex',
      description: 'Beregn hvor raskt kjøper ser ROI på roboten',
      inputs: [
        { id: 'inspections', label: 'Inspeksjoner per måned', unit: 'stk', default: 5, min: 1, max: 50, step: 1 },
        { id: 'pricePerInspection', label: 'Pris per inspeksjon', unit: 'kr', default: 15000, min: 5000, max: 25000, step: 500 },
        { id: 'machinePrice', label: 'Maskinkostnad', unit: 'kr', default: 180000, min: 180000, max: 180000, step: 1 },
      ],
      formula: (v) => {
        const monthly = v.inspections * v.pricePerInspection;
        const roiMonths = Math.ceil(v.machinePrice / monthly);
        const yearOne = monthly * 12 - v.machinePrice;
        const yearTwo = monthly * 12;
        return [
          { label: 'Månedlig inntekt', value: `${monthly.toLocaleString('nb-NO')} kr` },
          { label: 'ROI-punkt', value: `${roiMonths} måneder`, highlight: true },
          { label: 'Nettoinntekt år 1', value: `${yearOne.toLocaleString('nb-NO')} kr` },
          { label: 'Inntekt år 2', value: `${yearTwo.toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    timeline: [
      { phase: 'MVP', duration: '3 mnd', description: 'Prototype-robot med fuktsensor og rapport-API' },
      { phase: 'Pilot', duration: '2 mnd', description: 'Prøvedrift med ett forsikringsselskap, 20 bygg' },
      { phase: 'Salg', duration: '3 mnd', description: 'Første tre kontrakter, servicemodel klar' },
      { phase: 'Skaler', duration: '6 mnd', description: '10 selskaper, 2. generasjon robot' },
    ],
  },

  grip: {
    slug: 'grip',
    code: 'GRIP',
    name: 'KIRURG-TRENER',
    tagline: 'Ikke en leke-hanske. Simulerer motstanden i ekte vev.',
    color: '#00e87f',
    buyer: 'Medisinstudier · Sykehus',
    model: 'B2B · Hardware',
    problem: 'Kirurgstudenter får for lite hands-on trening. Kadavertrening er dyrt, sjeldent og etisk komplisert. Eksisterende haptiske simulatorer koster 400 000–600 000 kr og er for komplekse for hverdagsbruk.',
    solution: 'KIRURG-TRENER er en haptisk hanske som simulerer den eksakte motstanden i forskjellig vev — bløtvev, bindevev, organer — for presisjonstrening av skalpell- og suturteknikk.',
    why: 'Markedslederen selger til 400 000 kr. Du bygger for 80 000 og selger for 200 000 — halvparten av konkurrentprisen med 60 % margin. Medisinsk utdanning er budsjett-fast, og å halvere innkjøpsprisen er et sterkt argument.',
    stats: [
      { label: 'Salgspris', value: '200 000 kr' },
      { label: 'Produksjonskostnad', value: '80 000 kr' },
      { label: 'Bruttomargin', value: '60 %' },
      { label: 'Konkurrentpris', value: '400 000 kr' },
    ],
    businessModel: {
      title: 'Hardware-salg + innholdslisens',
      description: 'Selg hansken som hardware. I tillegg selger du tilgang til vev-profil-biblioteket (nye organer, prosedyrer) som årsabonnement.',
      lines: [
        'Hardware: 200 000 kr per enhet',
        'Innholdsabonnement: 15 000 kr / år',
        'Mål: 30 medisinstudier i Norden = 6 MNOK år 1',
        'Etter år 3: 60 % fra abonnement',
      ],
    },
    roi: {
      type: 'margin',
      description: 'Beregn omsetning og margin',
      inputs: [
        { id: 'units', label: 'Enheter solgt per år', unit: 'stk', default: 15, min: 1, max: 100, step: 1 },
        { id: 'unitPrice', label: 'Salgspris', unit: 'kr', default: 200000, min: 150000, max: 250000, step: 5000 },
        { id: 'cost', label: 'Produksjonskost', unit: 'kr', default: 80000, min: 60000, max: 100000, step: 5000 },
        { id: 'subscriptions', label: 'Abonnementer (år 2+)', unit: 'stk', default: 20, min: 0, max: 200, step: 5 },
      ],
      formula: (v) => {
        const revenue = v.units * v.unitPrice;
        const cogs = v.units * v.cost;
        const gross = revenue - cogs;
        const margin = Math.round((gross / revenue) * 100);
        const subscriptionRevenue = v.subscriptions * 15000;
        return [
          { label: 'Omsetning', value: `${revenue.toLocaleString('nb-NO')} kr` },
          { label: 'Bruttofortjeneste', value: `${gross.toLocaleString('nb-NO')} kr`, highlight: true },
          { label: 'Margin', value: `${margin} %` },
          { label: 'Abonnementsinntekt (år 2)', value: `${subscriptionRevenue.toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    timeline: [
      { phase: 'R&D', duration: '4 mnd', description: 'Haptisk motor og vev-simuleringsprofiler' },
      { phase: 'Validering', duration: '2 mnd', description: 'Brukertesting med kirurger og medisinerstudenter' },
      { phase: 'CE-merking', duration: '3 mnd', description: 'Medisinsk godkjenning for EU/EØS' },
      { phase: 'Salg', duration: '3 mnd', description: 'Første 5 medisinstudier, referanseprogram' },
    ],
  },

  varde: {
    slug: 'varde',
    code: 'VARDE',
    name: 'KATASTROFE-MESH',
    tagline: 'Ikke en stake. Et komplett katastrofe-internett.',
    color: '#ff6a35',
    buyer: 'UNHCR · NATO · Sivilforsvaret',
    model: 'B2G · System',
    problem: 'Etter jordskjelv, oversvømmelse eller konflikt kollapser telekommunikasjon. Hjelpeorganisasjoner bruker dager på å etablere internett — i en situasjon der timer teller og koordinering er bokstavelig talt liv og død.',
    solution: 'KATASTROFE-MESH er en kasse med 50 selvkonfigurerende solar-stakes. De kastes ut fra helikopter, lander i et mønster og bygger automatisk et mesh-nettverk som dekker 100 km² innen 20 minutter.',
    why: 'UNHCR og NATO har allerede budsjetter for katastrofekommunikasjon. Eksisterende løsninger krever spesialistpersonell og tid. Helikopterdrop + selvkonfigurasjon er et paradigmeskifte.',
    stats: [
      { label: 'Systempris', value: '2 000 000 kr' },
      { label: 'Dekning', value: '100 km²' },
      { label: 'Noder', value: '50 per kasse' },
      { label: 'Oppsettid', value: '< 20 minutter' },
    ],
    businessModel: {
      title: 'Offentlig innkjøp + vedlikehold',
      description: 'Salg direkte til forsvars- og humanitærbudsjetter. Kontrakter inkluderer opplæring, vedlikehold og nodeutskiftning. Strategisk partnerskap med Kongsberg eller Thales kan akselerere godkjenning.',
      lines: [
        'Systempris: 2 000 000 kr',
        'Vedlikeholdskontrakt: 200 000 kr / år',
        'Produksjonskost (estimat): 600 000 kr',
        'Mål: 5 systemer = 10 MNOK år 1',
      ],
    },
    roi: {
      type: 'capex',
      description: 'Beregn prosjektinntekter og margin',
      inputs: [
        { id: 'systems', label: 'Systemer solgt', unit: 'stk', default: 3, min: 1, max: 20, step: 1 },
        { id: 'systemPrice', label: 'Systempris', unit: 'kr', default: 2000000, min: 1500000, max: 3000000, step: 100000 },
        { id: 'cogs', label: 'Produksjonskost per system', unit: 'kr', default: 600000, min: 400000, max: 900000, step: 50000 },
        { id: 'maintenance', label: 'Vedlikeholdskontrakter', unit: 'stk', default: 5, min: 0, max: 30, step: 1 },
      ],
      formula: (v) => {
        const revenue = v.systems * v.systemPrice;
        const cogs = v.systems * v.cogs;
        const gross = revenue - cogs;
        const maintenanceRev = v.maintenance * 200000;
        return [
          { label: 'Systemsalg', value: `${revenue.toLocaleString('nb-NO')} kr` },
          { label: 'Bruttofortjeneste', value: `${gross.toLocaleString('nb-NO')} kr`, highlight: true },
          { label: 'Margin', value: `${Math.round((gross / revenue) * 100)} %` },
          { label: 'Vedlikeholdsinntekt', value: `${maintenanceRev.toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    timeline: [
      { phase: 'Prototype', duration: '5 mnd', description: 'Solar-node med LoRa/LTE mesh, 10 noder testfelt' },
      { phase: 'Felttesting', duration: '3 mnd', description: 'Samarbeid med Sivilforsvaret, reell katastrofescenario' },
      { phase: 'NATO-godkjenning', duration: '6 mnd', description: 'STANAG-kompatibilitet og partnerkontrakt' },
      { phase: 'Leveranse', duration: '3 mnd', description: 'Første leveranse til UNHCR og NATO' },
    ],
  },

  trygg: {
    slug: 'trygg',
    code: 'TRYGG',
    name: 'LIVSIGNAL-VAKT',
    tagline: 'Ikke en fallsensor. Oppdager hjertestans 8 sekunder før kollaps.',
    color: '#ff2d55',
    buyer: 'Sykehjem · Omsorgsboliger',
    model: 'SaaS · Subscription',
    problem: 'Hvert år dør hundrevis av sykehjemsbeboere av hjertestans uten at noen er til stede. Eksisterende løsninger (fallsensorer, kameraspill) reagerer etter at personen allerede er skadd — for sent for mange.',
    solution: 'LIVSIGNAL-VAKT bruker Doppler-radar (ikke kamera — full personvern) til å overvåke hjertets bevegelse kontinuerlig. Systemet oppdager uregelmessig puls og hjertestans 8 sekunder før personen kollapser, og varsler 113 og pleier automatisk.',
    why: '8 sekunder er nok til at pleier kan nå rommet. Subscription-modell gir forutsigbar inntekt, og sykehjem har allerede budsjetter for velferdsteknologi.',
    stats: [
      { label: 'Månedspris', value: '800 kr/mnd' },
      { label: 'Per beboer', value: 'Radar per rom' },
      { label: 'Varsling', value: '8 sek pre-kollaps' },
      { label: 'Personvern', value: 'Radar · Ikke kamera' },
    ],
    businessModel: {
      title: 'Subscription per beboer',
      description: 'Sykehjem betaler 800 kr per beboer per måned. Ingen CAPEX for kjøper — radar-enheten inngår i abonnementet. Du selger abonnementet direkte til sykehjemledelsen, gjerne via velferdsteknologi-kommunekontrakter.',
      lines: [
        'Abonnement: 800 kr / beboer / mnd',
        '50-beboers sykehjem: 40 000 kr / mnd',
        '200-beboers kommunekontrakt: 160 000 kr / mnd',
        'Mål: 1 000 beboere = 800 000 kr / mnd',
      ],
    },
    roi: {
      type: 'subscription',
      description: 'Beregn MRR basert på antall beboere og sykehjem',
      inputs: [
        { id: 'residents', label: 'Antall beboere totalt', unit: 'stk', default: 150, min: 10, max: 5000, step: 10 },
        { id: 'pricePerResident', label: 'Pris per beboer', unit: 'kr/mnd', default: 800, min: 600, max: 1200, step: 50 },
        { id: 'churnRate', label: 'Churn rate', unit: '% per år', default: 5, min: 0, max: 30, step: 1 },
      ],
      formula: (v) => {
        const mrr = v.residents * v.pricePerResident;
        const arr = mrr * 12;
        const ltv = mrr * 12 / (v.churnRate / 100 || 0.05);
        return [
          { label: 'MRR', value: `${mrr.toLocaleString('nb-NO')} kr`, highlight: true },
          { label: 'ARR', value: `${arr.toLocaleString('nb-NO')} kr` },
          { label: 'LTV (ved churn)', value: `${Math.round(ltv).toLocaleString('nb-NO')} kr` },
          { label: 'Mål 1 000 beboere', value: `${(1000 * v.pricePerResident).toLocaleString('nb-NO')} kr/mnd` },
        ];
      },
    },
    timeline: [
      { phase: 'Prototype', duration: '4 mnd', description: 'Radar-algoritme for hjerterytme-deteksjon' },
      { phase: 'Klinisk test', duration: '3 mnd', description: 'Validering på ett sykehjem, 20 rom' },
      { phase: 'CE-merking', duration: '4 mnd', description: 'Medisinsk CE og GDPR-compliance' },
      { phase: 'Utrulling', duration: '3 mnd', description: 'Første kommunekontrakt, 3 sykehjem' },
    ],
  },

  sverm: {
    slug: 'sverm',
    code: 'SVERM-VEVAR',
    name: 'BRANNMANN-KOFFERT',
    tagline: 'Ikke en lekekasse. 6 termiske droner som redder liv gjennom røyk.',
    color: '#ffaa00',
    buyer: 'Brannvesen · 110-sentraler',
    model: 'B2G · Hardware',
    problem: 'Brannmenn går inn i brennende bygg uten å vite where folk er. Varmebildekameraer finnes, men de er punkt-enheter som krever at noen bærer dem — og det betyr risiko. I røyk ser man ingenting.',
    solution: 'BRANNMANN-KOFFERT er en koffert med 6 autonome termiske droner. Åpne kofferten, trykk start — dronene letter, sprer seg i svermen, kartlegger hele bygget og sender sanntids varmebilde-oversikt og GPS-koordinater for alle varmekilder til brannsjefens tablet.',
    why: 'Brannvesen har innkjøpsbudsjetter på 1–5 MNOK per enhet. Eksisterende dronesystemer er punkt-enheter, ikke svermbaserte. 1,2 MNOK er rimelig for et system som kan redde brannmenn og sivile.',
    stats: [
      { label: 'Salgspris', value: '1 200 000 kr' },
      { label: 'Droner', value: '6 per koffert' },
      { label: 'Sensor', value: 'Termisk IR' },
      { label: 'Oppsettid', value: '< 60 sekunder' },
    ],
    businessModel: {
      title: 'Koffertsalg + servicekontrakt',
      description: 'Salg av koffert-system direkte til brannvesen og 110-sentraler. Inkludert programvareoppdateringer i 2 år. Deretter servicekontrakt på 120 000 kr / år for oppdateringer og drone-utskiftning.',
      lines: [
        'Koffertpris: 1 200 000 kr',
        'Servicekontrakt (år 3+): 120 000 kr / år',
        'Produksjonskost (estimat): 300 000 kr',
        'Mål: 20 brannstasjoner = 24 MNOK år 1',
      ],
    },
    roi: {
      type: 'capex',
      description: 'Beregn salgsomsetning og margin',
      inputs: [
        { id: 'units', label: 'Kofferter solgt', unit: 'stk', default: 10, min: 1, max: 100, step: 1 },
        { id: 'unitPrice', label: 'Salgspris', unit: 'kr', default: 1200000, min: 900000, max: 1800000, step: 50000 },
        { id: 'cogs', label: 'Produksjonskost', unit: 'kr', default: 300000, min: 200000, max: 500000, step: 25000 },
        { id: 'serviceContracts', label: 'Servicekontrakter (år 2)', unit: 'stk', default: 15, min: 0, max: 100, step: 1 },
      ],
      formula: (v) => {
        const revenue = v.units * v.unitPrice;
        const cogs = v.units * v.cogs;
        const gross = revenue - cogs;
        const serviceRev = v.serviceContracts * 120000;
        return [
          { label: 'Salgsomsetning', value: `${revenue.toLocaleString('nb-NO')} kr` },
          { label: 'Bruttofortjeneste', value: `${gross.toLocaleString('nb-NO')} kr`, highlight: true },
          { label: 'Margin', value: `${Math.round((gross / revenue) * 100)} %` },
          { label: 'Service år 2', value: `${serviceRev.toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    timeline: [
      { phase: 'Sværm-prototype', duration: '4 mnd', description: 'Autonom 3-drone sverm, termisk kamera' },
      { phase: 'Branntesting', duration: '2 mnd', description: 'Testing i kontrollert brannskole med 110' },
      { phase: 'DNB-godkjenning', duration: '3 mnd', description: 'DSB-sertifisering og ICAO-regulatorikk' },
      { phase: 'Salg', duration: '3 mnd', description: 'Pilotavtale med 3 brannstasjoner' },
    ],
  },
};

const ALL_SLUGS = Object.keys(COMPANIES);

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ALL_SLUGS.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const company = COMPANIES[slug] ?? null;
  return { props: { company } };
};

interface Props { company: CompanyData | null; }

export default function CompanyPage({ company }: Props) {
  const router = useRouter();
  if (router.isFallback || !company) return <div style={{ background: '#040406', color: '#fff', minHeight: '100vh' }}>Laster...</div>;

  return (
    <>
      <Head>
        <title>{company.name} — {company.code}</title>
        <meta name="description" content={company.tagline} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ background: '#040406', color: '#fff', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', minHeight: '100vh' }}>

        {/* ── BACK NAV ── */}
        <nav style={{ padding: '1.5rem clamp(1.5rem, 5vw, 5rem)', borderBottom: '1px solid #0c0c14', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: '#444', textDecoration: 'none',
            fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M11 6H1M5 2L1 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Alle selskaper
          </Link>
          <span style={{ color: '#1a1a26' }}>·</span>
          <span style={{ color: company.color, fontSize: '0.7rem', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
            {company.code}
          </span>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          padding: 'clamp(4rem, 10vw, 10rem) clamp(1.5rem, 6vw, 6rem)',
          borderBottom: '1px solid #0c0c14',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 0% 50%, ${company.color}08 0%, transparent 65%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: '1000px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: `${company.color}15`, border: `1px solid ${company.color}25`,
                color: company.color, borderRadius: '4px', padding: '0.3rem 0.7rem',
                fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>{company.code}</span>
              <span style={{ color: '#2a2a3a', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{company.buyer}</span>
              <span style={{ color: '#1e1e2e', fontSize: '0.65rem', background: '#0d0d18', padding: '0.2rem 0.55rem', borderRadius: '3px' }}>{company.model}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 0.95, marginBottom: '1.5rem' }}>
              {company.name}
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', color: '#888', maxWidth: '600px', lineHeight: 1.5 }}>
              {company.tagline}
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1px', background: `${company.color}12`,
          borderBottom: `1px solid ${company.color}15`,
        }}>
          {company.stats.map((s) => (
            <div key={s.label} style={{ padding: '1.75rem 2rem', background: '#040406' }}>
              <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3a3a4a', marginBottom: '0.5rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: company.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── PROBLEM / SOLUTION ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: '#0c0c14' }}>
          <div style={{ padding: 'clamp(2.5rem, 6vw, 5rem)', background: '#040406' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#444', marginBottom: '1.25rem' }}>Problemet</p>
            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', color: '#888', lineHeight: 1.8 }}>{company.problem}</p>
          </div>
          <div style={{ padding: 'clamp(2.5rem, 6vw, 5rem)', background: '#050508', borderLeft: `3px solid ${company.color}30` }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: company.color, marginBottom: '1.25rem', opacity: 0.8 }}>Løsningen</p>
            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', color: '#ccc', lineHeight: 1.8 }}>{company.solution}</p>
          </div>
        </section>

        {/* ── WHY NOW ── */}
        <section style={{ padding: 'clamp(3rem, 7vw, 7rem) clamp(1.5rem, 6vw, 6rem)', borderTop: '1px solid #0c0c14', background: '#020204' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#333', marginBottom: '1.5rem' }}>Hvorfor dette fungerer</p>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#aaa', lineHeight: 1.9 }}>{company.why}</p>
          </div>
        </section>

        {/* ── BUSINESS MODEL ── */}
        <section style={{ padding: 'clamp(3rem, 7vw, 7rem) clamp(1.5rem, 6vw, 6rem)', borderTop: '1px solid #0c0c14' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#333', marginBottom: '1rem' }}>Forretningsmodell</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              {company.businessModel.title}
            </h2>
            <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '560px', fontSize: '0.95rem' }}>
              {company.businessModel.description}
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px', background: `${company.color}12`,
              border: `1px solid ${company.color}18`, borderRadius: '8px', overflow: 'hidden',
            }}>
              {company.businessModel.lines.map((line) => (
                <div key={line} style={{ padding: '1.1rem 1.4rem', background: '#040406', fontSize: '0.875rem', color: '#aaa', lineHeight: 1.5 }}>
                  <span style={{ color: company.color, marginRight: '0.5rem' }}>→</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROI CALCULATOR ── */}
        <section style={{ padding: 'clamp(3rem, 7vw, 7rem) clamp(1.5rem, 6vw, 6rem)', borderTop: '1px solid #0c0c14', background: '#020204' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#333', marginBottom: '1rem' }}>Interaktiv kalkulator</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              ROI-kalkulator
            </h2>
            <p style={{ color: '#444', marginBottom: '3rem', fontSize: '0.875rem' }}>{company.roi.description}</p>
            <RoiCalculator company={company} />
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section style={{ padding: 'clamp(3rem, 7vw, 7rem) clamp(1.5rem, 6vw, 6rem)', borderTop: '1px solid #0c0c14' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#333', marginBottom: '3rem' }}>Go-to-market</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: '#0c0c14', borderRadius: '8px', overflow: 'hidden' }}>
              {company.timeline.map((phase, i) => (
                <div key={phase.phase} style={{ padding: '1.75rem 1.5rem', background: '#040406', position: 'relative' }}>
                  <div style={{ fontSize: '0.6rem', color: company.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.35rem', opacity: 0.7 }}>
                    Fase {i + 1}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#fff' }}>{phase.phase}</div>
                  <div style={{ fontSize: '0.65rem', color: company.color, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{phase.duration}</div>
                  <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6, margin: 0 }}>{phase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OTHER COMPANIES ── */}
        <section style={{ padding: 'clamp(3rem, 7vw, 7rem) clamp(1.5rem, 6vw, 6rem)', borderTop: '1px solid #0c0c14', background: '#020204' }}>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2a2a3a', marginBottom: '2rem' }}>De andre fire</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {ALL_SLUGS.filter((s) => s !== company.slug).map((s) => {
              const other = COMPANIES[s];
              return (
                <Link key={s} href={`/selskap/${s}`} style={{
                  padding: '0.6rem 1.4rem', borderRadius: '8px',
                  background: `${other.color}0c`, border: `1px solid ${other.color}20`,
                  color: other.color, textDecoration: 'none',
                  fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {other.code}
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
}

function RoiCalculator({ company }: { company: CompanyData }) {
  const initialValues = Object.fromEntries(company.roi.inputs.map((i) => [i.id, i.default]));
  const [values, setValues] = useState<Record<string, number>>(initialValues);
  const results = company.roi.formula(values);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {company.roi.inputs.map((input) => {
          const isFixed = input.min === input.max;
          return (
            <div key={input.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.05em' }} htmlFor={input.id}>
                  {input.label}
                </label>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: company.color, fontVariantNumeric: 'tabular-nums' }}>
                  {values[input.id].toLocaleString('nb-NO')} {input.unit}
                </span>
              </div>
              {isFixed ? (
                <div style={{ height: '6px', borderRadius: '3px', background: `${company.color}20`, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '3px', background: company.color, opacity: 0.4 }} />
                </div>
              ) : (
                <input
                  id={input.id}
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={values[input.id]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [input.id]: Number(e.target.value) }))}
                  style={{
                    width: '100%', height: '6px', cursor: 'pointer',
                    appearance: 'none', background: `linear-gradient(to right, ${company.color} ${((values[input.id] - input.min) / (input.max - input.min)) * 100}%, #1a1a26 0%)`,
                    borderRadius: '3px', outline: 'none', border: 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Results */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1px', background: `${company.color}15`,
        border: `1px solid ${company.color}20`, borderRadius: '10px',
        overflow: 'hidden', alignContent: 'start',
      }}>
        {results.map((r) => (
          <div key={r.label} style={{ padding: '1.4rem 1.25rem', background: r.highlight ? `${company.color}08` : '#040406' }}>
            <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#3a3a4a', marginBottom: '0.4rem' }}>
              {r.label}
            </div>
            <div style={{
              fontSize: r.highlight ? 'clamp(1rem, 2.5vw, 1.3rem)' : 'clamp(0.875rem, 1.8vw, 1.05rem)',
              fontWeight: 700, color: r.highlight ? company.color : '#aaa',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
