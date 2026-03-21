import { useMemo, useState } from 'react';

interface PlanBlock {
  title: string;
  detail: string;
  time: string;
}

interface MoneyMove {
  title: string;
  detail: string;
  payoff: string;
}

interface MomentumPlan {
  focusBlocks: PlanBlock[];
  moneyMoves: MoneyMove[];
  systems: string[];
  reminder: string;
}

const PLANS: Record<string, MomentumPlan> = {
  utsettelse: {
    focusBlocks: [
      {
        title: 'Startblokk (12 min)',
        detail: 'Åpne oppgaven og gjør det minste mulige første steget. Ingen perfeksjon, bare bevegelse.',
        time: '08:30',
      },
      {
        title: 'Fokusblokk (45 min)',
        detail: 'Ingen varsler, full skjerm, én oppgave. Spill bakgrunnslyd uten vokal.',
        time: '09:00',
      },
      {
        title: 'Leveringsblokk (18 min)',
        detail: 'Send, publiser eller del det du har. Lukk oppgaven med en synlig milepæl.',
        time: '10:00',
      },
    ],
    moneyMoves: [
      {
        title: 'Mikrotilbud i DM',
        detail: 'Send en konkret løsning til 5 potensielle kunder før lunsj.',
        payoff: 'kr 1 500–4 000',
      },
      {
        title: 'Reaktiver gamle leads',
        detail: 'Sjekk hvem som stoppet i kjøpsreisen og send en rask oppfølging.',
        payoff: 'kr 3 000+',
      },
    ],
    systems: [
      'Bruk 2-minuttersregelen for start på alt vanskelig.',
      'Hold en synlig "dagens seier"-liste i appen.',
      'Planlegg belønning direkte etter leveringsblokk.',
    ],
    reminder: 'Action slår angst. Start lite, lever stort.',
  },
  distraksjon: {
    focusBlocks: [
      {
        title: 'Skjermlås (5 min)',
        detail: 'Skru på Fokus-modus og lås sosiale apper til 2x daglig.',
        time: '08:00',
      },
      {
        title: 'Dypt arbeid (60 min)',
        detail: 'Én oppgave, én fane. Hver distraksjon noteres på en parkeringstavle.',
        time: '08:15',
      },
      {
        title: 'Konsolidering (20 min)',
        detail: 'Oppsummer hva som ble gjort i appen og lås neste steg.',
        time: '09:30',
      },
    ],
    moneyMoves: [
      {
        title: 'Produktiser en service',
        detail: 'Gjør 1 tjeneste til en fast pakke med 3 nivåer.',
        payoff: 'kr 5 000–12 000',
      },
      {
        title: 'Timepris-boost',
        detail: 'Hev prisen på det mest etterspurte tilbudet med 15 %.',
        payoff: 'kr 2 000–6 000',
      },
    ],
    systems: [
      'Hold mobil utenfor rommet i fokusblokken.',
      'Bruk lyd som trigger fokus (samme spilleliste hver gang).',
      'Logg distraksjoner og velg én å eliminere per uke.',
    ],
    reminder: 'Færre valg = mer verdi. Fjern støy, øk margin.',
  },
  impuls: {
    focusBlocks: [
      {
        title: 'Pause før kjøp (7 min)',
        detail: 'Legg varen i handlekurv og vent syv minutter før beslutning.',
        time: 'Hele dagen',
      },
      {
        title: 'Inntektsfokus (40 min)',
        detail: 'Prioriter aktiviteter som gir direkte inntekt før kreative sidespor.',
        time: '10:00',
      },
      {
        title: 'Kveldsoppsummering (10 min)',
        detail: 'Sjekk dagsbudsjett og flytt overskudd til sparekonto.',
        time: '20:30',
      },
    ],
    moneyMoves: [
      {
        title: '24-timers tilbud',
        detail: 'Skap et tidsbegrenset tilbud på det du allerede kan levere.',
        payoff: 'kr 2 500–8 000',
      },
      {
        title: 'Selg et system',
        detail: 'Gjør din prosess om til en betalt guide eller workshop.',
        payoff: 'kr 4 000–15 000',
      },
    ],
    systems: [
      'Sett automatisk trekk til sparing hver uke.',
      'Lag en handleliste og kjøp kun på forhåndsdefinerte tider.',
      'Bytt impulsbelønninger til opplevelser uten kostnad.',
    ],
    reminder: 'Forsink impulsen, forsterk planen.',
  },
  overveldelse: {
    focusBlocks: [
      {
        title: 'Nedskalering (15 min)',
        detail: 'Skriv alt på hodet ned, velg tre ting som faktisk betyr noe.',
        time: '08:00',
      },
      {
        title: 'Prioritetsblokk (50 min)',
        detail: 'Gjør den viktigste tingen først og sett resten på vent.',
        time: '08:30',
      },
      {
        title: 'Delegasjon (20 min)',
        detail: 'Identifiser én oppgave du kan outsource eller automatisere.',
        time: '10:00',
      },
    ],
    moneyMoves: [
      {
        title: 'Gjenbruk det du allerede har',
        detail: 'Pakk om eksisterende materiale til en ny inntektsstrøm.',
        payoff: 'kr 1 000–5 000',
      },
      {
        title: 'Partner-salg',
        detail: 'Finn én samarbeidspartner og lag et delt tilbud.',
        payoff: 'kr 5 000+',
      },
    ],
    systems: [
      'Arbeid i 90-minutters sykluser med tydelig slutt.',
      'Fjern 1–2 prosjekter for å frigjøre mental kapasitet.',
      'Bruk ukentlig review for å holde kursen.',
    ],
    reminder: 'Fokus på få, gi bedre resultat og mer penger.',
  },
};

const WEAKNESS_OPTIONS = [
  { value: 'utsettelse', label: 'Utsettelse / prokrastinering' },
  { value: 'distraksjon', label: 'Distraksjon / støy' },
  { value: 'impuls', label: 'Impulskjøp / raske valg' },
  { value: 'overveldelse', label: 'Overveldelse / for mye på en gang' },
];

const MONEY_MULTIPLIER: Record<string, number> = {
  utsettelse: 1.4,
  distraksjon: 1.6,
  impuls: 1.3,
  overveldelse: 1.5,
};

export default function HomePage() {
  const [weakness, setWeakness] = useState('utsettelse');
  const [goal, setGoal] = useState('Bygge en stabil sideinntekt på 30 000 kr/mnd');
  const [currentIncome, setCurrentIncome] = useState('12000');
  const [commitment, setCommitment] = useState('5');

  const plan = useMemo(() => PLANS[weakness], [weakness]);
  const incomeNumber = Number(currentIncome.replace(/\s/g, '')) || 0;
  const commitmentNumber = Number(commitment) || 0;
  const weeklyGain = Math.round(incomeNumber * MONEY_MULTIPLIER[weakness]);
  const focusScore = Math.min(100, 40 + commitmentNumber * 12);

  return (
    <div className="momentum">
      <header className="hero">
        <p className="eyebrow">MomentumOS · iOS + Vab + React</p>
        <h1>Appen som tar tak i menneskelig svakhet og gjør den om til penger.</h1>
        <p>
          MomentumOS kombinerer fokusdesign, smarte inntektsgrep og hverdagsautomatisering. Den tar det du
          vanligvis faller for — distraksjon, prokrastinering, impulser — og gjør det til en enkel plan som gir
          mer kontroll og mer inntekt.
        </p>
        <div className="hero-grid">
          <div>
            <h3>iOS-vennlig rytme</h3>
            <p>Store trykkflater, korte blokker og smart påminnelse. Perfekt for bruk på farten.</p>
          </div>
          <div>
            <h3>Vab / Web-klar</h3>
            <p>Samme strategi på web: klare prioriteringer, visuelle mål og raske penger.</p>
          </div>
          <div>
            <h3>React-motor</h3>
            <p>Alt er dynamisk: form, plan, inntektsberegning og systemforslag i én flyt.</p>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="card">
          <h2>1. Fortell hva som stopper deg</h2>
          <label>
            Din største svakhet
            <select value={weakness} onChange={(event) => setWeakness(event.target.value)}>
              {WEAKNESS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Målet ditt
            <input value={goal} onChange={(event) => setGoal(event.target.value)} />
          </label>
          <div className="row">
            <label>
              Dagens inntekt (kr)
              <input
                value={currentIncome}
                onChange={(event) => setCurrentIncome(event.target.value)}
                inputMode="numeric"
              />
            </label>
            <label>
              Hvor mange fokusblokker per uke?
              <input
                value={commitment}
                onChange={(event) => setCommitment(event.target.value)}
                inputMode="numeric"
              />
            </label>
          </div>
          <div className="score">
            <div>
              <span className="score-title">Fokus-score</span>
              <strong>{focusScore}/100</strong>
            </div>
            <div>
              <span className="score-title">Estimert ukesløft</span>
              <strong>kr {weeklyGain.toLocaleString('no-NO')}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>2. Dagens momentumplan</h2>
          <p className="highlight">{plan.reminder}</p>
          <div className="grid">
            {plan.focusBlocks.map((block) => (
              <article key={block.title}>
                <h3>{block.title}</h3>
                <p>{block.detail}</p>
                <span>{block.time}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>3. Penger nå</h2>
          <div className="grid">
            {plan.moneyMoves.map((move) => (
              <article key={move.title}>
                <h3>{move.title}</h3>
                <p>{move.detail}</p>
                <span>{move.payoff}</span>
              </article>
            ))}
          </div>
          <p className="goal">Mål: {goal}</p>
        </section>

        <section className="card">
          <h2>4. System som holder</h2>
          <ul className="system-list">
            {plan.systems.map((system) => (
              <li key={system}>{system}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <div>
          <h3>Hvorfor dette funker</h3>
          <p>
            Du får én tydelig plan, én tydelig inntektsstiger og en systemliste som gjør deg mer robust enn
            motivasjon alene. MomentumOS gjør svakheten din til et mønster du kan styre.
          </p>
        </div>
        <div>
          <h3>Neste steg</h3>
          <p>
            Lag en daglig rutine i appen, koble til kalender, og bruk appen i 14 dager for å bygge en ny vane.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .momentum {
          font-family: 'Inter', system-ui, sans-serif;
          padding: 48px 24px 64px;
          color: #0b0b12;
          background: #f6f4ff;
        }

        .hero {
          max-width: 980px;
          margin: 0 auto 40px;
          background: linear-gradient(135deg, #1b1148 0%, #3820a3 55%, #7a66ff 100%);
          color: #fefbff;
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(36, 21, 92, 0.35);
        }

        .hero h1 {
          font-size: 2.3rem;
          margin: 12px 0 16px;
        }

        .hero p {
          line-height: 1.6;
        }

        .eyebrow {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          opacity: 0.8;
        }

        .hero-grid {
          display: grid;
          gap: 16px;
          margin-top: 28px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .hero-grid div {
          background: rgba(255, 255, 255, 0.12);
          padding: 16px;
          border-radius: 16px;
          backdrop-filter: blur(6px);
        }

        .layout {
          max-width: 980px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: #ffffff;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(60, 40, 150, 0.12);
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        input,
        select {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #ddd7ff;
          font-size: 1rem;
        }

        .row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .score {
          display: flex;
          justify-content: space-between;
          background: #f4f1ff;
          padding: 16px;
          border-radius: 16px;
        }

        .score-title {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #5643c6;
          margin-bottom: 6px;
        }

        .highlight {
          font-weight: 700;
          color: #32248f;
        }

        .grid {
          display: grid;
          gap: 16px;
          margin-top: 18px;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        }

        .grid article {
          background: #faf9ff;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #eee8ff;
        }

        .grid span {
          display: inline-block;
          margin-top: 10px;
          font-weight: 600;
          color: #4f33c4;
        }

        .goal {
          margin-top: 16px;
          font-weight: 600;
        }

        .system-list {
          padding-left: 18px;
          line-height: 1.6;
        }

        .footer {
          max-width: 980px;
          margin: 32px auto 0;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          color: #1f1a33;
        }

        @media (max-width: 700px) {
          .hero {
            padding: 28px;
          }

          .score {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
