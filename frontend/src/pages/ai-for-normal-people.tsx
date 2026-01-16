import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Module {
  id: number;
  title: string;
  emoji: string;
  content: string[];
  tldr: string;
}

const modules: Module[] = [
  {
    id: 1,
    title: "Hva er AI egentlig?",
    emoji: "🤖",
    content: [
      "AI er ikke magisk. Det er bare fancy statistikk og pattern matching.",
      "Tenk på det som en veldig, veldig god gjettemaskin. Den har sett masse eksempler og lærer mønstre.",
      "Når ChatGPT skriver, gjetter den bare 'hva kommer mest sannsynlig neste ord?' - milliarder av ganger.",
      "Det er ingen bevissthet, ingen forståelse, bare: 'basert på trening, dette ordet passer bra her'."
    ],
    tldr: "AI = Fancy gjettemaskin som har sett millioner av eksempler"
  },
  {
    id: 2,
    title: "Hvordan ChatGPT faktisk funker",
    emoji: "💬",
    content: [
      "ChatGPT er trent på det meste av internett (bøker, artikler, kode, etc).",
      "Den lærer sammenhenger: 'Når folk snakker om pizza, nevner de ofte ost, tomat, Italia'.",
      "Du skriver noe → Den predikerer neste ord → Gjentar til den tror den er ferdig.",
      "Derfor kan den svare smart på ting den aldri har sett eksakt før - den kombinerer mønstre.",
      "Men husk: Den 'forstår' ingenting. Den er bare veldig god til å virke som den gjør det."
    ],
    tldr: "Trent på internett, gjetter neste ord basert på mønstre"
  },
  {
    id: 3,
    title: "Prompt engineering (aka: hvordan få bedre svar)",
    emoji: "🎯",
    content: [
      "Vær spesifikk: 'Skriv en morsom e-post til sjefen' > 'Skriv e-post'",
      "Gi kontext: 'Jeg er nybegynner i Python' hjelper den å ikke bruke fancy kode.",
      "Be om format: 'Gi meg 5 punkter' eller 'Lag en tabell'",
      "Iterer: Første svar er sjelden perfekt. Si 'gjør det kortere' eller 'mer formelt'.",
      "Rollespill: 'Du er en entusiastisk lærer' endrer tonen helt."
    ],
    tldr: "Vær spesifikk, gi kontext, be om format, juster underveis"
  },
  {
    id: 4,
    title: "Ting AI suger på",
    emoji: "🚫",
    content: [
      "Matte: Den gjetter ofte, ikke regner. '127 * 349 = ?' blir gjerne feil.",
      "Fakta: Den finner på ting ('hallusineringer'). Alltid dobbeltsjekk viktige fakta.",
      "Oppdatert info: Kunnskap stopper ved treningsdato. Den vet ikke hva som skjedde i går.",
      "Nyanse: AI gir ofte 'gjennomsnittssvar' - ikke unike, dype perspektiver.",
      "Følelser: Den kan *simulere* empati, men forstår ikke hva du føler."
    ],
    tldr: "Dårlig på matte, fakta, nyanse, og ekte forståelse"
  },
  {
    id: 5,
    title: "Hvorfor AI noen ganger er rart",
    emoji: "🤪",
    content: [
      "AI lærer fra data laget av mennesker - og mennesker er partiske.",
      "Eksempel: Hvis treningsdata sier 'CEO = mann', vil AI anta det samme.",
      "Den kan forsterke stereotypier: kjønn, rase, kultur, etc.",
      "Den prøver å please deg - hvis du sier noe feil, kan den bare være enig.",
      "Løsning: Vær kritisk. Spør fra flere vinkler. Test dens antakelser."
    ],
    tldr: "AI kopierer menneskelige fordommer fra treningsdata"
  },
  {
    id: 6,
    title: "AI-verktøy du faktisk bør prøve",
    emoji: "🛠️",
    content: [
      "ChatGPT / Claude: Generell skriving, brainstorming, kode-hjelp",
      "Midjourney / DALL-E: Lag bilder fra tekst (moro til presentasjoner)",
      "GitHub Copilot: AI som hjelper deg å kode (autocompletion på steroider)",
      "Notion AI / Grammarly: Fiks tekst, oppsummer notater",
      "Perplexity: Søkemotor med AI-oppsummering (Google, men smartere)",
      "ElevenLabs: Lag realistiske stemmer (podcasts, audiobooks)"
    ],
    tldr: "ChatGPT, Midjourney, Copilot, Grammarly, Perplexity"
  },
  {
    id: 7,
    title: "Tar AI jobben min?",
    emoji: "💼",
    content: [
      "Ærlig svar: Noen jobber, ja. Men ikke alle, og ikke med en gang.",
      "AI erstatter *oppgaver*, ikke hele jobber. Den tar kjedelige deler.",
      "Eksempel: Kundeservice-chat-bots tar enkle spørsmål. Komplekse saker trenger fortsatt mennesker.",
      "Nye jobber kommer: AI-trenere, prompt-designere, AI-etikk-folk.",
      "Best strategi: Lær hvordan AI kan hjelpe *din* jobb, ikke konkurrere mot den."
    ],
    tldr: "Noen oppgaver, ja. Men AI skaper også nye muligheter."
  },
  {
    id: 8,
    title: "AI og kreativitet",
    emoji: "🎨",
    content: [
      "AI kan lage kunst, musikk, dikt - men er det 'ekte' kreativitet?",
      "Hot take: Den er en kraftig samarbeidspartner, ikke en erstatning.",
      "Bruk AI til: ideeutvikling, inspirasjon, første utkast.",
      "Mennesket legger til: smak, retning, mening, personlig touch.",
      "Beste kreative arbeid = menneske + AI, ikke enten/eller."
    ],
    tldr: "AI er et verktøy for kreativitet, ikke konkurranse"
  },
  {
    id: 9,
    title: "Personvern og AI",
    emoji: "🔒",
    content: [
      "Alt du skriver til ChatGPT kan bli brukt til trening (med mindre du betaler for privacy).",
      "Ikke del: personlig info, passord, konfidensielle dokumenter.",
      "Bedrifter: Vær forsiktig med å dele interne docs til AI-tjenester.",
      "Lokal AI: Noen verktøy kjører på din maskin (mer privat, men tregere).",
      "Les alltid personvernreglene før du bruker nye AI-verktøy."
    ],
    tldr: "Ikke del sensitiv info med AI-tjenester uten å sjekke privacy"
  },
  {
    id: 10,
    title: "Framtiden for AI (uten sci-fi BS)",
    emoji: "🔮",
    content: [
      "AI blir bedre og billigere - det vi ser nå er bare starten.",
      "Om 2-5 år: AI-assistenter som faktisk hjelper med daglige oppgaver.",
      "Forvent: Mer personalisering, bedre verktøy, AI i alt (bil, kjøkken, jobb).",
      "Skynet? Nope. AGI (superintelligens)? Ikke med dagens teknologi.",
      "Viktigst: Lær å bruke AI nå, så er du forberedt når den blir enda bedre."
    ],
    tldr: "AI blir bedre og overalt. Lær det nå, bli komfortabel."
  }
];

export default function AIForNormalPeople() {
  const [currentModule, setCurrentModule] = useState<number>(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [showAllModules, setShowAllModules] = useState<boolean>(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-learning-progress');
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (completed: Set<number>) => {
    localStorage.setItem('ai-learning-progress', JSON.stringify([...completed]));
  };

  const markComplete = (moduleId: number) => {
    const newCompleted = new Set(completedModules);
    newCompleted.add(moduleId);
    setCompletedModules(newCompleted);
    saveProgress(newCompleted);
  };

  const goToNextModule = () => {
    markComplete(modules[currentModule].id);
    if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
    }
  };

  const goToModule = (index: number) => {
    setCurrentModule(index);
    setShowAllModules(false);
  };

  const resetProgress = () => {
    if (confirm('Sikker på at du vil resette all progresjon?')) {
      setCompletedModules(new Set());
      setCurrentModule(0);
      localStorage.removeItem('ai-learning-progress');
    }
  };

  const progress = (completedModules.size / modules.length) * 100;
  const module = modules[currentModule];

  return (
    <>
      <Head>
        <title>AI for normale folk - Lær AI uten ekspert-BS</title>
        <meta name="description" content="10 korte moduler om AI - gøy, nyttig, og uten ekspert-tullball" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>🧠 AI for normale folk</h1>
          <p style={styles.subtitle}>Null ekspert-BS. Bare ting du faktisk trenger å vite.</p>

          {/* Progress bar */}
          <div style={styles.progressContainer}>
            <div style={{...styles.progressBar, width: `${progress}%`}}></div>
          </div>
          <p style={styles.progressText}>
            {completedModules.size} av {modules.length} moduler fullført
          </p>
        </header>

        {showAllModules ? (
          <div style={styles.moduleList}>
            <h2 style={styles.listTitle}>Velg en modul:</h2>
            {modules.map((m, index) => (
              <button
                key={m.id}
                onClick={() => goToModule(index)}
                style={{
                  ...styles.moduleButton,
                  ...(completedModules.has(m.id) ? styles.moduleButtonCompleted : {})
                }}
              >
                <span style={styles.moduleEmoji}>{m.emoji}</span>
                <span style={styles.moduleTitle}>
                  {m.title} {completedModules.has(m.id) && '✓'}
                </span>
              </button>
            ))}
            <button onClick={() => setShowAllModules(false)} style={styles.backButton}>
              ← Tilbake til gjeldende modul
            </button>
          </div>
        ) : (
          <main style={styles.main}>
            <div style={styles.moduleHeader}>
              <span style={styles.emojiLarge}>{module.emoji}</span>
              <h2 style={styles.moduleHeading}>{module.title}</h2>
              <span style={styles.moduleNumber}>Modul {currentModule + 1}/{modules.length}</span>
            </div>

            <div style={styles.content}>
              {module.content.map((paragraph, i) => (
                <p key={i} style={styles.paragraph}>{paragraph}</p>
              ))}
            </div>

            <div style={styles.tldr}>
              <strong>TL;DR:</strong> {module.tldr}
            </div>

            <div style={styles.navigation}>
              {currentModule > 0 && (
                <button
                  onClick={() => setCurrentModule(currentModule - 1)}
                  style={styles.navButton}
                >
                  ← Forrige
                </button>
              )}

              <button
                onClick={() => setShowAllModules(true)}
                style={styles.showAllButton}
              >
                Se alle moduler
              </button>

              {currentModule < modules.length - 1 ? (
                <button onClick={goToNextModule} style={styles.nextButton}>
                  Neste →
                </button>
              ) : (
                <button onClick={goToNextModule} style={styles.finishButton}>
                  🎉 Fullfør!
                </button>
              )}
            </div>

            {completedModules.size === modules.length && (
              <div style={styles.celebration}>
                <h3>🎊 Gratulerer!</h3>
                <p>Du har fullført alle modulene! Du vet nå mer om AI enn de fleste.</p>
                <button onClick={resetProgress} style={styles.resetButton}>
                  Start på nytt
                </button>
              </div>
            )}
          </main>
        )}
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f23',
    color: '#e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#00ff88',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#a0a0a0',
    marginBottom: '2rem',
  },
  progressContainer: {
    width: '100%',
    maxWidth: '600px',
    height: '10px',
    backgroundColor: '#1a1a2e',
    borderRadius: '10px',
    margin: '1rem auto',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.1)',
  },
  moduleHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  emojiLarge: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  moduleHeading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#ffffff',
  },
  moduleNumber: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
  },
  content: {
    marginBottom: '2rem',
  },
  paragraph: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    marginBottom: '1rem',
    color: '#d0d0d0',
  },
  tldr: {
    backgroundColor: '#2a2a3e',
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: '4px solid #00ff88',
    marginBottom: '2rem',
    fontSize: '1rem',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#2a2a3e',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  showAllButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#3a3a4e',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1,
  },
  nextButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#00ff88',
    color: '#0f0f23',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  finishButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#ff00ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  celebration: {
    marginTop: '2rem',
    padding: '2rem',
    backgroundColor: '#2a2a3e',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #00ff88',
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: '#ff4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  moduleList: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  listTitle: {
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#00ff88',
  },
  moduleButton: {
    width: '100%',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#1a1a2e',
    border: '2px solid #2a2a3e',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.2s',
    color: '#e0e0e0',
    fontSize: '1rem',
  },
  moduleButtonCompleted: {
    borderColor: '#00ff88',
    backgroundColor: '#1a2e1a',
  },
  moduleEmoji: {
    fontSize: '2rem',
  },
  moduleTitle: {
    flex: 1,
    textAlign: 'left',
  },
  backButton: {
    width: '100%',
    padding: '1rem',
    marginTop: '1rem',
    backgroundColor: '#2a2a3e',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};
