"use client";

import { useState } from "react";
import styles from "./CitizenReportForm.module.css";

const REPORT_TYPES = [
  { value: "dead_fish", label: "Død fisk" },
  { value: "discoloration", label: "Unormal vatnfarge" },
  { value: "water_sample", label: "Vassprøve" },
  { value: "other", label: "Anna" },
];

export default function CitizenReportForm() {
  const [type, setType] = useState("dead_fish");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description, location }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.thanks}>
        <p className={styles.thanksText}>
          // RAPPORT SENDT //<br />
          Takk. Kvar observasjon tel.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label}>TYPE</label>
        <div className={styles.typeGrid}>
          {REPORT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`${styles.typeBtn} ${type === t.value ? styles.active : ""}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="location">LOKASJON</label>
        <input
          id="location"
          className={styles.input}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="T.d. 'Nordvest for Fedje kai'"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="desc">SKILDRING</label>
        <textarea
          id="desc"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Kva såg/lukta/fekk du? Vær spesifikk."
          required
        />
      </div>

      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? "SENDER..." : "SEND RAPPORT"}
      </button>
    </form>
  );
}
