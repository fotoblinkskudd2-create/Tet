import PollutionMap from "./components/PollutionMap";
import MercuryTimeline from "./components/MercuryTimeline";
import CitizenReportForm from "./components/CitizenReportForm";
import styles from "./page.module.css";

export const revalidate = 60;

const TIMELINE_EVENTS = [
  { year: 1945, label: "U-864 synker med 62 tonn kvikksølv om bord" },
  { year: 2003, label: "Vraket oppdaga av Forsvarets kystvakt" },
  { year: 2013, label: "Stortinget vedtar tiltak — ingen handling" },
  { year: 2019, label: "Kapslings-prosjekt startar" },
  { year: 2024, label: "Framleis ikkje heva. Giften lekk." },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>U-864 TRACKER</div>
        <div className={styles.subtitle}>
          KVIKKSØLV-MONITOR // FEDJE, HORDALAND // LIVE DATA
        </div>
        <div className={styles.status}>
          <span className={styles.dot} />
          AKTIV OVERVÅKING
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>FORURENSNINGSKART</h2>
          <PollutionMap />
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.statsBox}>
            <h3 className={styles.statLabel}>Hg NIVÅ (Fedje)</h3>
            <div className={styles.statValue}>0.47 ppm</div>
            <div className={styles.statDelta}>↑ 0.03 siste 30 dagar</div>
          </div>

          <div className={styles.statsBox}>
            <h3 className={styles.statLabel}>ESTIMERT KVIKKSØLV</h3>
            <div className={styles.statValue}>~62 tonn</div>
            <div className={styles.statSub}>framleis på havbotnen</div>
          </div>

          <div className={styles.statsBox}>
            <h3 className={styles.statLabel}>DJUPN</h3>
            <div className={styles.statValue}>158 m</div>
            <div className={styles.statSub}>under havoverflata</div>
          </div>

          <div className={styles.timeline}>
            <h3 className={styles.sectionTitle}>TIDSLINJE</h3>
            {TIMELINE_EVENTS.map((e) => (
              <div key={e.year} className={styles.timelineItem}>
                <span className={styles.year}>{e.year}</span>
                <span className={styles.event}>{e.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>HISTORISKE KVIKKSØLV-NIVÅ</h2>
        <MercuryTimeline />
      </section>

      <section className={styles.reportSection}>
        <h2 className={styles.sectionTitle}>RAPPORTER OBSERVASJON</h2>
        <CitizenReportForm />
      </section>
    </main>
  );
}
