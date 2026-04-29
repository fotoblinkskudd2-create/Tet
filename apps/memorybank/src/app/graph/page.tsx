import KnowledgeGraph from "../components/KnowledgeGraph";
import styles from "./graph.module.css";

export default function GraphPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← MEMORYBANK</a>
        <div className={styles.title}>KNOWLEDGE GRAPH</div>
        <a href="/write" className={styles.newNote}>+ Note</a>
      </header>
      <div className={styles.canvas}>
        <KnowledgeGraph />
      </div>
    </main>
  );
}
