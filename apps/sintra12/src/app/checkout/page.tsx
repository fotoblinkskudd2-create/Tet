"use client";

import { useState } from "react";
import styles from "./checkout.module.css";

type VibeLevel = "safe" | "adventurous" | "unhinged";

const VIBE_OPTIONS: { value: VibeLevel; label: string; desc: string }[] = [
  { value: "safe", label: "SAFE", desc: "Just the thing I ordered. No surprises." },
  { value: "adventurous", label: "ADVENTUROUS", desc: "Maybe one extra weird thing. I can handle it." },
  { value: "unhinged", label: "UNHINGED", desc: "Fill the box. I trust you. God help me." },
];

export default function CheckoutPage() {
  const [vibe, setVibe] = useState<VibeLevel | null>(null);
  const [step, setStep] = useState<"vibe" | "details" | "confirm">("vibe");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function placeOrder() {
    setLoading(true);
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, name, address, email }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className={styles.main}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>YOUR WEIRD SHIT IS ON THE WAY.</h1>
          <p className={styles.successSub}>
            Check your email. Try not to refresh tracking every 3 minutes.
          </p>
          <a href="/" className={styles.backHome}>← BACK TO STORE</a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <a href="/" className={styles.back}>← SINTRA12</a>

      <div className={styles.steps}>
        {["vibe", "details", "confirm"].map((s, i) => (
          <div
            key={s}
            className={`${styles.step} ${step === s ? styles.active : ""} ${
              ["vibe", "details", "confirm"].indexOf(step) > i ? styles.done : ""
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {step === "vibe" && (
        <section className={styles.section}>
          <h2 className={styles.question}>HOW WEIRD CAN WE GET?</h2>
          <div className={styles.vibeGrid}>
            {VIBE_OPTIONS.map((v) => (
              <button
                key={v.value}
                className={`${styles.vibeBtn} ${vibe === v.value ? styles.vibeBtnActive : ""}`}
                onClick={() => setVibe(v.value)}
              >
                <div className={styles.vibeLabel}>{v.label}</div>
                <div className={styles.vibeDesc}>{v.desc}</div>
              </button>
            ))}
          </div>
          <button
            className={styles.next}
            disabled={!vibe}
            onClick={() => setStep("details")}
          >
            NEXT →
          </button>
        </section>
      )}

      {step === "details" && (
        <section className={styles.section}>
          <h2 className={styles.question}>WHERE DO WE SEND IT?</h2>
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              className={styles.textarea}
              placeholder="Address (street, city, postal, country)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
          <div className={styles.navRow}>
            <button className={styles.back2} onClick={() => setStep("vibe")}>← BACK</button>
            <button
              className={styles.next}
              disabled={!name || !email || !address}
              onClick={() => setStep("confirm")}
            >
              CONFIRM →
            </button>
          </div>
        </section>
      )}

      {step === "confirm" && (
        <section className={styles.section}>
          <h2 className={styles.question}>READY?</h2>
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>VIBE</span>
              <span className={styles.summaryVal}>{vibe?.toUpperCase()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>TO</span>
              <span className={styles.summaryVal}>{name}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>EMAIL</span>
              <span className={styles.summaryVal}>{email}</span>
            </div>
          </div>
          <div className={styles.navRow}>
            <button className={styles.back2} onClick={() => setStep("details")}>← BACK</button>
            <button
              className={styles.orderBtn}
              onClick={placeOrder}
              disabled={loading}
            >
              {loading ? "PROCESSING..." : "PLACE ORDER"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
