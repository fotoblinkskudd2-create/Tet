import Link from "next/link";
import styles from "./page.module.css";

const DAILY_PROMPTS = [
  "Beskriv morgonen din som om den var ein dans.",
  "Kva luktar byen din av? Vær spesifikk. Vær brutal.",
  "Skriv om det du ikkje tør å seie høgt.",
  "Ta den kjedeligaste tingen du gjorde i dag. Gjer den episk.",
  "Kva har du aldri sagt til mor di? Sei det no.",
  "Beskriv ei kjensle du ikkje har ord for. Finn orda.",
];

function getTodayPrompt(): string {
  const dayIndex = new Date().getDay();
  return DAILY_PROMPTS[dayIndex % DAILY_PROMPTS.length];
}

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>GONZO JOURNAL</div>
        <div className={styles.tagline}>
          SKRIV RÅTT — SKRIV ÆRLEG — BLI BETRE
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.prompt}>
          <span className={styles.promptLabel}>DAGENS PROMPT //</span>
          <p className={styles.promptText}>{getTodayPrompt()}</p>
        </div>

        <Link href="/write" className={styles.ctaLink}>
          <div className={styles.cta}>START Å SKRIVE</div>
        </Link>
      </section>

      <section className={styles.manifesto}>
        <p>
          Gonzo Journal er ikkje ein dagbok. Det er eit vitnemål.
          <br />
          Kvar tekst du skriv vert analysert av AI for rawness, lyrikk og
          emosjonell ærlighet.
          <br />
          Ingen bullshit. Ingen onboarding. Berre ord og sanning.
        </p>
      </section>

      <nav className={styles.nav}>
        <Link href="/write">[ SKRIV ]</Link>
        <Link href="/feed">[ HALL OF GONZO ]</Link>
      </nav>
    </main>
  );
}
