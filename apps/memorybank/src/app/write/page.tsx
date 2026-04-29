"use client";

import { useState } from "react";
import type { ExtractionResult } from "@five-apps/ai";
import styles from "./write.module.css";

export default function WritePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<ExtractionResult & { id?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  async function save() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const TYPE_COLORS: Record<string, string> = {
    person: "#f472b6",
    concept: "#a78bfa",
    place: "#34d399",
    book: "#fbbf24",
    event: "#60a5fa",
    idea: "#f97316",
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← MEMORYBANK</a>
        <span className={styles.wordCount}>{wordCount} words</span>
      </header>

      <input
        className={styles.titleInput}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
      />

      <textarea
        className={styles.editor}
        value={content}
        onChange={(e) => { setContent(e.target.value); setResult(null); }}
        placeholder="What's on your mind? Write freely — AI will map it to your knowledge graph."
        autoFocus
      />

      <div className={styles.toolbar}>
        <button
          className={styles.saveBtn}
          onClick={save}
          disabled={loading || !content.trim()}
        >
          {loading ? "Saving..." : "Save + Extract"}
        </button>
      </div>

      {result && (
        <div className={styles.results}>
          <p className={styles.summary}>{result.summary}</p>

          <div className={styles.entities}>
            <h3 className={styles.sectionLabel}>EXTRACTED ENTITIES</h3>
            <div className={styles.entityList}>
              {result.entities.map((e, i) => (
                <span
                  key={i}
                  className={styles.entity}
                  style={{ borderColor: TYPE_COLORS[e.type] ?? "#6b7280" }}
                >
                  {e.text}
                  <span className={styles.entityType} style={{ color: TYPE_COLORS[e.type] }}>
                    {e.type}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {result.suggestedLinks.length > 0 && (
            <div className={styles.links}>
              <h3 className={styles.sectionLabel}>SUGGESTED CONNECTIONS</h3>
              <div className={styles.linkList}>
                {result.suggestedLinks.map((l, i) => (
                  <span key={i} className={styles.link}>→ {l}</span>
                ))}
              </div>
            </div>
          )}

          <a href="/graph" className={styles.graphLink}>View in Knowledge Graph →</a>
        </div>
      )}
    </main>
  );
}
