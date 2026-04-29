"use client";

import { useState, useCallback } from "react";
import type { GonzoMetrics } from "@five-apps/ai";
import { ScoreBar } from "@five-apps/ui";
import styles from "./write.module.css";

export default function WritePage() {
  const [text, setText] = useState("");
  const [metrics, setMetrics] = useState<GonzoMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const analyze = useCallback(async () => {
    if (!text.trim() || text.trim().split(/\s+/).length < 20) {
      setError("Skriv minst 20 ord før du analyserer.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Analyse feila.");
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noko gjekk galt.");
    } finally {
      setLoading(false);
    }
  }, [text]);

  const save = useCallback(async (isPublic: boolean) => {
    if (!metrics) return;
    setLoading(true);
    try {
      await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, metrics, isPublic }),
      });
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }, [text, metrics]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <a href="/" className={styles.back}>← GONZO JOURNAL</a>
        <span className={styles.wordCount}>{wordCount} ORD</span>
      </header>

      <textarea
        className={styles.editor}
        value={text}
        onChange={(e) => { setText(e.target.value); setMetrics(null); setSaved(false); }}
        placeholder="Skriv her. Ingen sensur. Ingen tilgivelse."
        autoFocus
      />

      <footer className={styles.footer}>
        <button
          className={styles.analyzeBtn}
          onClick={analyze}
          disabled={loading || wordCount < 20}
        >
          {loading ? "ANALYSERER..." : "ANALYSER"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {metrics && (
          <div className={styles.results}>
            <div className={styles.badge}>
              {metrics.badge ? (
                <span className={styles.badgeText}>🏅 {metrics.badge}</span>
              ) : (
                <span className={styles.scoreTotal}>SCORE: {metrics.totalScore}/500</span>
              )}
            </div>

            <div className={styles.bars}>
              <ScoreBar label="Rawness" value={metrics.rawness} color="#cc0000" />
              <ScoreBar label="Lyrikk" value={metrics.lyricism} color="#888888" />
              <ScoreBar label="Sansleg" value={metrics.sensoryDetail} color="#555555" />
              <ScoreBar label="Ærlighet" value={metrics.honesty} color="#cc0000" />
              <ScoreBar label="Dansmetaforar" value={metrics.danceMetaphors} color="#444444" />
            </div>

            <blockquote className={styles.feedback}>{metrics.feedback}</blockquote>

            {!saved && (
              <div className={styles.saveRow}>
                <button className={styles.savePrivate} onClick={() => save(false)} disabled={loading}>
                  LAGRE PRIVAT
                </button>
                <button className={styles.savePublic} onClick={() => save(true)} disabled={loading}>
                  DEL I HALL OF GONZO
                </button>
              </div>
            )}

            {saved && <p className={styles.savedMsg}>// LAGRA //</p>}
          </div>
        )}
      </footer>
    </main>
  );
}
