import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>MEMORYBANK</div>
        <p className={styles.sub}>Every thought. Every connection. Yours.</p>
      </header>

      <div className={styles.actions}>
        <Link href="/write" className={styles.card}>
          <div className={styles.cardIcon}>✏</div>
          <div className={styles.cardTitle}>New Note</div>
          <div className={styles.cardDesc}>
            Capture a thought. AI auto-extracts entities and links it to your graph.
          </div>
        </Link>

        <Link href="/graph" className={styles.card}>
          <div className={styles.cardIcon}>◎</div>
          <div className={styles.cardTitle}>Knowledge Graph</div>
          <div className={styles.cardDesc}>
            Explore your ideas as a living network. Discover unexpected connections.
          </div>
        </Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>—</span>
          <span className={styles.statLabel}>Notes</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>—</span>
          <span className={styles.statLabel}>Connections</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>—</span>
          <span className={styles.statLabel}>Entities</span>
        </div>
      </div>
    </main>
  );
}
