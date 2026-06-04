import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPaths, GetStaticProps } from 'next';

interface RoiInput { id: string; label: string; unit: string; default: number; min: number; max: number; step: number; }
interface RoiResult { label: string; value: string; big?: boolean; }
interface TimelineStep { phase: string; time: string; what: string; }

interface Company {
  slug: string;
  code: string;
  name: string;
  emoji: string;
  color: string;
  for: string;
  tagline: string;
  pain: string;
  fix: string;
  proof: string;
  facts: Array<{ icon: string; label: string; value: string }>;
  roi: { title: string; inputs: RoiInput[]; calc: (v: Record<string, number>) => RoiResult[]; };
  steps: TimelineStep[];
  nextSlug: string;
}

const DATA: Record<string, Company> = {
  otoro: {
    slug: 'otoro', code: 'OTORO', name: 'Lekkasjejeger Pro', emoji: '💧', color: '#0A84FF',
    for: 'For forsikringsselskaper',
    tagline: 'Finn vannlekkasjer før de blir store skader',
    pain: 'Vannskader er den vanligste og dyreste skadetypen i norske boliger. Forsikringsselskaper betaler ut milliarder hvert år — for skader som ble oppdaget for sent. Manuelle inspeksjoner skalerer ikke.',
    fix: 'Lekkasjejeger Pro er en autonom robot som kjøres gjennom bygget. Den oppdager fuktighet og trykkfall med høy presisjon, og genererer forsikringsrapport automatisk. Inspektøren sitter på kontoret.',
    proof: 'Markedsprisen for en manuell leilighetsinspeksjon er 15 000 kr. Roboten gjør det på 45 minutter. Etter 12 jobber har maskinen betalt for seg selv.',
    facts: [
      { icon: '💰', label: 'Salgspris', value: '180 000 kr' },
      { icon: '📋', label: 'Per inspeksjon', value: '15 000 kr' },
      { icon: '⏱️', label: 'Inspeksjonstid', value: '45 min / bygg' },
      { icon: '✅', label: 'ROI', value: '12 inspeksjoner' },
    ],
    roi: {
      title: 'Beregn kjøpers ROI',
      inputs: [
        { id: 'jobs', label: 'Inspeksjoner per måned', unit: '', default: 6, min: 1, max: 40, step: 1 },
        { id: 'fee', label: 'Pris per inspeksjon', unit: 'kr', default: 15000, min: 8000, max: 20000, step: 500 },
      ],
      calc: (v) => {
        const monthly = v.jobs * v.fee;
        const roi = Math.ceil(180000 / monthly);
        return [
          { label: 'Månedlig inntekt', value: `${monthly.toLocaleString('nb-NO')} kr` },
          { label: 'Måneder til ROI', value: `${roi} måneder`, big: true },
          { label: 'Fortjeneste år 1', value: `${(monthly * 12 - 180000).toLocaleString('nb-NO')} kr` },
          { label: 'Fortjeneste år 2', value: `${(monthly * 12).toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    steps: [
      { phase: 'Prototype', time: '3 mnd', what: 'Robot med fuktsensor og automatisk rapport-API' },
      { phase: 'Pilot', time: '2 mnd', what: 'Prøvedrift med ett forsikringsselskap, 20 bygg' },
      { phase: 'Første salg', time: '3 mnd', what: 'Tre kontrakter, servicemodell klar' },
      { phase: 'Skalering', time: '6 mnd', what: '10 selskaper, ny robotgenerasjon' },
    ],
    nextSlug: 'grip',
  },

  grip: {
    slug: 'grip', code: 'GRIP', name: 'Kirurg-Trener', emoji: '🫀', color: '#30D158',
    for: 'For medisinstudier og sykehus',
    tagline: 'Tren kirurgi som om du holder i ekte vev',
    pain: 'Kirurgstudenter mangler hands-on trening. Kadavertrening er sjeldent og dyrt. Eksisterende simulatorer koster 400 000 kr — for mye for de fleste medisinstudier.',
    fix: 'Kirurg-Trener er en haptisk hanske som simulerer motstanden i ekte vev: bløtvev, bindevev, organer. Studenten kjenner forskjellen mellom å snitte gjennom fett og muskel. Ingen kadaver. Ingen tidsbegrensning.',
    proof: 'Markedsleder selger til 400 000 kr. Vi selger til 200 000 kr — og tjener fortsatt 60 % margin. Halvparten av prisen er et åpent dør hos innkjøpsansvarlige.',
    facts: [
      { icon: '💰', label: 'Salgspris', value: '200 000 kr' },
      { icon: '🏭', label: 'Produksjonskost', value: '80 000 kr' },
      { icon: '📈', label: 'Bruttomargin', value: '60 %' },
      { icon: '🏆', label: 'Vs. konkurrent', value: '50% av prisen' },
    ],
    roi: {
      title: 'Beregn omsetning',
      inputs: [
        { id: 'units', label: 'Enheter solgt per år', unit: '', default: 15, min: 1, max: 100, step: 1 },
        { id: 'subs', label: 'Abonnementer år 2', unit: '', default: 20, min: 0, max: 150, step: 5 },
      ],
      calc: (v) => {
        const rev = v.units * 200000;
        const gross = v.units * 120000;
        const subRev = v.subs * 15000;
        return [
          { label: 'Omsetning år 1', value: `${rev.toLocaleString('nb-NO')} kr` },
          { label: 'Bruttofortjeneste', value: `${gross.toLocaleString('nb-NO')} kr`, big: true },
          { label: 'Abonnement år 2', value: `${subRev.toLocaleString('nb-NO')} kr` },
          { label: 'Total år 2', value: `${(gross + subRev).toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    steps: [
      { phase: 'R&D', time: '4 mnd', what: 'Haptisk motor og vev-profiler for 5 vevstyper' },
      { phase: 'Validering', time: '2 mnd', what: 'Testing med kirurger og medisinerstudenter' },
      { phase: 'CE-merking', time: '3 mnd', what: 'Medisinsk godkjenning for EU/EØS' },
      { phase: 'Salg', time: '3 mnd', what: 'Første 5 medisinstudier, referanseprogram' },
    ],
    nextSlug: 'varde',
  },

  varde: {
    slug: 'varde', code: 'VARDE', name: 'Katastrofe-Mesh', emoji: '📡', color: '#FF9F0A',
    for: 'For UNHCR, NATO og Sivilforsvaret',
    tagline: 'Internett over 100 km² — kastet fra helikopter',
    pain: 'Etter jordskjelv, flom eller krig kollapser mobilnett og internett. Hjelpeorganisasjoner bruker dager på å sette opp kommunikasjon. Dager der koordinering betyr liv og død.',
    fix: '50 solar-stakes kastes ut fra helikopter. De lander, planter seg i bakken, og snakker med naboene sine. Etter 20 minutter er mesh-nettverk oppe over 100 km². Selvkonfigurerende. Solcelledrevet. Ingen person trenger å berøre dem.',
    proof: 'UNHCR og NATO har allerede budsjetter for katastrofekommunikasjon. Eksisterende løsninger krever spesialistteam på bakken. Helikopterdrop endrer alt.',
    facts: [
      { icon: '💰', label: 'Systempris', value: '2 000 000 kr' },
      { icon: '📐', label: 'Nettdekning', value: '100 km²' },
      { icon: '🔢', label: 'Noder', value: '50 per kasse' },
      { icon: '⚡', label: 'Oppsettid', value: '< 20 minutter' },
    ],
    roi: {
      title: 'Beregn prosjektinntekter',
      inputs: [
        { id: 'systems', label: 'Systemer solgt per år', unit: '', default: 4, min: 1, max: 25, step: 1 },
        { id: 'maintenance', label: 'Vedlikeholdskontrakter', unit: '', default: 6, min: 0, max: 40, step: 1 },
      ],
      calc: (v) => {
        const rev = v.systems * 2000000;
        const gross = v.systems * 1400000;
        const maint = v.maintenance * 200000;
        return [
          { label: 'Salgsomsetning', value: `${rev.toLocaleString('nb-NO')} kr` },
          { label: 'Bruttofortjeneste', value: `${gross.toLocaleString('nb-NO')} kr`, big: true },
          { label: 'Vedlikeholdsinntekt', value: `${maint.toLocaleString('nb-NO')} kr` },
          { label: 'Totalomsetning', value: `${(rev + maint).toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    steps: [
      { phase: 'Prototype', time: '5 mnd', what: 'Solar-node med LoRa/LTE mesh, 10 noder' },
      { phase: 'Felttesting', time: '3 mnd', what: 'Test med Sivilforsvaret i reelt scenario' },
      { phase: 'Sertifisering', time: '6 mnd', what: 'NATO STANAG-kompatibilitet' },
      { phase: 'Leveranse', time: '3 mnd', what: 'Første leveranse til UNHCR og NATO' },
    ],
    nextSlug: 'trygg',
  },

  trygg: {
    slug: 'trygg', code: 'TRYGG', name: 'Livsignal-Vakt', emoji: '❤️', color: '#FF375F',
    for: 'For sykehjem og omsorgsboliger',
    tagline: 'Vet at hjertet stopper — 8 sekunder før personen faller',
    pain: 'Hvert år dør beboere på sykehjem av hjertestans uten at noen er til stede. Fallsensorer reagerer etter at personen allerede er skadet. Det er allerede for sent.',
    fix: 'Livsignal-Vakt bruker Doppler-radar (ikke kamera — full personvern) til å overvåke hjertets bevegelse. Systemet oppdager hjertestans 8 sekunder før personen kollapser og varsler pleier og 113 automatisk. 8 sekunder er nok til å nå rommet.',
    proof: 'Sykehjem har allerede budsjetter for velferdsteknologi. Abonnementsmodellen gir ingen CAPEX for kjøper. 50 beboere = 40 000 kr per måned.',
    facts: [
      { icon: '💰', label: 'Pris per beboer', value: '800 kr/mnd' },
      { icon: '⏱️', label: 'Varslingsfrist', value: '8 sek pre-kollaps' },
      { icon: '🔒', label: 'Personvern', value: 'Radar · Ikke kamera' },
      { icon: '📱', label: 'Ingen CAPEX', value: 'Radar inkl. i abo.' },
    ],
    roi: {
      title: 'Beregn månedlig inntekt',
      inputs: [
        { id: 'residents', label: 'Antall beboere', unit: '', default: 80, min: 10, max: 2000, step: 10 },
        { id: 'price', label: 'Pris per beboer', unit: 'kr/mnd', default: 800, min: 600, max: 1200, step: 50 },
      ],
      calc: (v) => {
        const mrr = v.residents * v.price;
        const arr = mrr * 12;
        const target = 1000 * v.price;
        return [
          { label: 'Månedlig inntekt (MRR)', value: `${mrr.toLocaleString('nb-NO')} kr`, big: true },
          { label: 'Årlig inntekt (ARR)', value: `${arr.toLocaleString('nb-NO')} kr` },
          { label: 'Mål: 1 000 beboere', value: `${target.toLocaleString('nb-NO')} kr/mnd` },
          { label: 'Mål: 5 000 beboere', value: `${(5000 * v.price).toLocaleString('nb-NO')} kr/mnd` },
        ];
      },
    },
    steps: [
      { phase: 'Prototype', time: '4 mnd', what: 'Radar-algoritme for hjerterytme-deteksjon' },
      { phase: 'Klinisk test', time: '3 mnd', what: 'Validering på ett sykehjem, 20 rom' },
      { phase: 'CE-merking', time: '4 mnd', what: 'Medisinsk CE og GDPR-compliance' },
      { phase: 'Utrulling', time: '3 mnd', what: 'Første kommunekontrakt, 3 sykehjem' },
    ],
    nextSlug: 'sverm',
  },

  sverm: {
    slug: 'sverm', code: 'SVERM-VEVAR', name: 'Brannmann-Koffert', emoji: '🔥', color: '#FF6B00',
    for: 'For brannvesen og 110-sentraler',
    tagline: 'Se gjennom røyk. Finn folk. På 60 sekunder.',
    pain: 'Brannmenn går inn i brennende bygg uten å vite hvor folk er. Røyk gjør det umulig å se. Hvert minutt teller — og feil valg koster liv.',
    fix: 'Åpne kofferten. Trykk start. 6 termiske droner letter, sprer seg i svermen og kartlegger hele bygget. Sanntids varmebilde og GPS-koordinater for alle varmekilder sendes til brannsjefens nettbrett — mens dronene er inne i brannen.',
    proof: 'Brannvesen kjøper allerede termisk utstyr for 500 000 – 2 000 000 kr. Et autonomt dronesystem til 1,2 MNOK som er oppe på 60 sekunder er et klart salgsargument.',
    facts: [
      { icon: '💰', label: 'Salgspris', value: '1 200 000 kr' },
      { icon: '🚁', label: 'Droner', value: '6 per koffert' },
      { icon: '🌡️', label: 'Sensor', value: 'Termisk IR' },
      { icon: '⚡', label: 'Oppsettid', value: '< 60 sekunder' },
    ],
    roi: {
      title: 'Beregn salgsomsetning',
      inputs: [
        { id: 'units', label: 'Kofferter solgt', unit: '', default: 8, min: 1, max: 100, step: 1 },
        { id: 'service', label: 'Servicekontrakter år 2', unit: '', default: 12, min: 0, max: 80, step: 1 },
      ],
      calc: (v) => {
        const rev = v.units * 1200000;
        const gross = v.units * 900000;
        const svc = v.service * 120000;
        return [
          { label: 'Salgsomsetning', value: `${rev.toLocaleString('nb-NO')} kr` },
          { label: 'Bruttofortjeneste', value: `${gross.toLocaleString('nb-NO')} kr`, big: true },
          { label: 'Margin', value: `${Math.round((900000 / 1200000) * 100)} %` },
          { label: 'Service år 2', value: `${svc.toLocaleString('nb-NO')} kr` },
        ];
      },
    },
    steps: [
      { phase: 'Prototype', time: '4 mnd', what: 'Autonom 3-drone sverm med termisk sensor' },
      { phase: 'Branntesting', time: '2 mnd', what: 'Test i kontrollert brannskole med 110' },
      { phase: 'Sertifisering', time: '3 mnd', what: 'DSB-godkjenning og ICAO-regulatorikk' },
      { phase: 'Salg', time: '3 mnd', what: 'Pilotavtale med 3 brannstasjoner' },
    ],
    nextSlug: 'otoro',
  },
};

const SLUGS = Object.keys(DATA);

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: SLUGS.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => ({
  props: { company: DATA[params?.slug as string] ?? null },
});

export default function CompanyPage({ company: c }: { company: Company | null }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries((c?.roi.inputs ?? []).map((i) => [i.id, i.default]))
  );

  if (router.isFallback || !c) {
    return <div style={{ background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Laster...</div>;
  }

  const results = c.roi.calc(vals);
  const next = DATA[c.nextSlug];

  return (
    <>
      <Head>
        <title>{c.name} — {c.code}</title>
        <meta name="description" content={c.tagline} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <div style={{
        background: '#000', color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        minHeight: '100vh', WebkitFontSmoothing: 'antialiased',
      }}>

        {/* ── TOP NAV ── */}
        <div style={{
          padding: 'env(safe-area-inset-top, 0) 20px 0',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: c.color, textDecoration: 'none', fontSize: 15, fontWeight: 600,
            }}>
              ← Alle selskaper
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 80px' }}>

          {/* ── HERO ── */}
          <div style={{ paddingTop: 48, paddingBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{c.emoji}</div>
            <div style={{
              display: 'inline-block', fontSize: 12, fontWeight: 700,
              color: c.color, background: `${c.color}18`,
              borderRadius: 8, padding: '5px 12px', marginBottom: 14, letterSpacing: '0.3px',
            }}>
              {c.for}
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 12 }}>
              {c.name}
            </h1>
            <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontWeight: 400 }}>
              {c.tagline}
            </p>
          </div>

          {/* ── FACTS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
            {c.facts.map((f) => (
              <div key={f.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4, letterSpacing: '0.3px' }}>{f.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* ── PROBLEM ── */}
          <Section label="Problemet" color={c.color}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75 }}>{c.pain}</p>
          </Section>

          {/* ── SOLUTION ── */}
          <Section label="Løsningen" color={c.color}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75 }}>{c.fix}</p>
          </Section>

          {/* ── WHY ── */}
          <Section label="Forretningscase" color={c.color}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75 }}>{c.proof}</p>
          </Section>

          {/* ── ROI CALCULATOR ── */}
          <Section label={c.roi.title} color={c.color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
              {c.roi.inputs.map((input) => (
                <div key={input.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} htmlFor={input.id}>
                      {input.label}
                    </label>
                    <span style={{ fontSize: 16, fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums' }}>
                      {vals[input.id].toLocaleString('nb-NO')}{input.unit ? ` ${input.unit}` : ''}
                    </span>
                  </div>
                  <input
                    id={input.id}
                    type="range"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={vals[input.id]}
                    onChange={(e) => setVals((prev) => ({ ...prev, [input.id]: Number(e.target.value) }))}
                    style={{
                      width: '100%', height: 6, cursor: 'pointer',
                      appearance: 'none', WebkitAppearance: 'none',
                      background: `linear-gradient(to right, ${c.color} ${((vals[input.id] - input.min) / (input.max - input.min)) * 100}%, rgba(255,255,255,0.12) 0%)`,
                      borderRadius: 3, outline: 'none', border: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {results.map((r) => (
                <div key={r.label} style={{
                  background: r.big ? `${c.color}15` : 'rgba(255,255,255,0.04)',
                  border: r.big ? `1px solid ${c.color}30` : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '14px',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{r.label}</div>
                  <div style={{ fontSize: r.big ? 18 : 15, fontWeight: 700, color: r.big ? c.color : 'rgba(255,255,255,0.8)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}>
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── TIMELINE ── */}
          <Section label="Veien dit" color={c.color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {c.steps.map((step, i) => (
                <div key={step.phase} style={{ display: 'flex', gap: 16, paddingBottom: i < c.steps.length - 1 ? 24 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 16,
                      background: `${c.color}20`, border: `1.5px solid ${c.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: c.color,
                    }}>
                      {i + 1}
                    </div>
                    {i < c.steps.length - 1 && (
                      <div style={{ width: 1.5, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 6 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{step.phase}</span>
                      <span style={{
                        fontSize: 11, background: 'rgba(255,255,255,0.06)',
                        borderRadius: 6, padding: '2px 8px', color: 'rgba(255,255,255,0.4)',
                      }}>{step.time}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{step.what}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── NEXT COMPANY ── */}
          {next && (
            <Link href={`/selskap/${next.slug}`} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 20,
              textDecoration: 'none', marginTop: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${next.color}18`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
              }}>
                {next.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Neste selskap</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{next.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{next.tagline}</div>
              </div>
              <div style={{ color: next.color, fontSize: 20 }}>→</div>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: color, opacity: 0.7,
        letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12,
      }}>
        {label}
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '20px',
      }}>
        {children}
      </div>
    </div>
  );
}
