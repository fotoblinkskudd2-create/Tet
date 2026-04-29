import styles from "./feed.module.css";

interface Entry {
  id: string;
  content: string;
  upvotes: number;
  createdAt: string;
  gonzoScore: {
    totalScore: number;
    rawness: number;
    badge: string | null;
    feedback: string;
  } | null;
}

async function getTopEntries(): Promise<Entry[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/entries`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function excerpt(text: string, words = 40): string {
  const w = text.trim().split(/\s+/);
  return w.length <= words ? text : w.slice(0, words).join(" ") + "...";
}

export default async function FeedPage() {
  const entries = await getTopEntries();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← GONZO JOURNAL</a>
        <h1 className={styles.title}>HALL OF GONZO</h1>
        <p className={styles.sub}>DEI BESTE TEKSTANE DENNE VEKA</p>
      </header>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <p>Ingen tekstar enno.</p>
          <a href="/write" className={styles.writeLink}>VÆR FØRST. SKRIV NO.</a>
        </div>
      ) : (
        <ol className={styles.list}>
          {entries.map((entry, i) => (
            <li key={entry.id} className={styles.item}>
              <div className={styles.rank}>#{i + 1}</div>
              <div className={styles.content}>
                <p className={styles.excerpt}>{excerpt(entry.content)}</p>
                <div className={styles.meta}>
                  {entry.gonzoScore?.badge && (
                    <span className={styles.badge}>{entry.gonzoScore.badge}</span>
                  )}
                  <span className={styles.score}>
                    {entry.gonzoScore?.totalScore ?? 0} / 500
                  </span>
                  <span className={styles.upvotes}>▲ {entry.upvotes}</span>
                </div>
                {entry.gonzoScore?.feedback && (
                  <blockquote className={styles.feedback}>
                    {entry.gonzoScore.feedback}
                  </blockquote>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
