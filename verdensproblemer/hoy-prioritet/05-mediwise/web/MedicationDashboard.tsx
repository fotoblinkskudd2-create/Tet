// MediWise Web — Medisin-dashboard med påminnelser, interaksjoner og historikk
"use client";

import { useState, useEffect, useCallback } from "react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  active: boolean;
}

interface Reminder {
  id: string;
  medication_id: string;
  medication_name: string;
  scheduled_at: string;
  confirmed_at: string | null;
}

interface Interaction {
  severity: "low" | "moderate" | "severe";
  description: string;
  recommendation: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mw_auth_token") : null;
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...opts,
  });
  return res.json();
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = {
    severe: { bg: "bg-red-100 text-red-800", label: "Alvorlig" },
    moderate: { bg: "bg-yellow-100 text-yellow-800", label: "Moderat" },
    low: { bg: "bg-green-100 text-green-800", label: "Lav" },
  }[severity] || { bg: "bg-gray-100", label: severity };

  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>;
}

function PendingReminders({ reminders, onConfirm }: { reminders: Reminder[]; onConfirm: (id: string) => void }) {
  const pending = reminders.filter((r) => !r.confirmed_at);
  if (pending.length === 0) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
      <span className="text-3xl">✅</span>
      <p className="font-semibold text-green-800 mt-2">Alle doser tatt!</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Neste doser</h3>
      </div>
      <div className="divide-y">
        {pending.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{r.medication_name}</p>
              <p className="text-sm text-gray-500">
                {new Date(r.scheduled_at).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={() => onConfirm(r.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              aria-label={`Bekreft at du har tatt ${r.medication_name}`}
            >
              ✓ Tatt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractionAlerts({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-orange-200 shadow-sm">
      <div className="p-4 border-b bg-orange-50 rounded-t-2xl">
        <h3 className="font-semibold text-orange-800">⚠️ Interaksjoner oppdaget</h3>
      </div>
      <div className="divide-y">
        {interactions.map((int, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <SeverityBadge severity={int.severity} />
            </div>
            <p className="text-sm font-medium text-gray-800">{int.description}</p>
            <p className="text-sm text-gray-500 mt-1">{int.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedicationsList({ medications }: { medications: Medication[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Mine medisiner</h3>
        <span className="text-sm text-gray-400">{medications.length} aktive</span>
      </div>
      <div className="divide-y">
        {medications.map((med) => (
          <div key={med.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-blue-600">💊</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{med.name}</p>
              <p className="text-sm text-gray-500">{med.dosage} — {med.frequency}</p>
              {med.instructions && (
                <p className="text-xs text-gray-400 mt-0.5">{med.instructions}</p>
              )}
            </div>
            {med.active && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktiv</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdherenceChart({ reminders }: { reminders: Reminder[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dayStats = last7Days.map((date) => {
    const dayReminders = reminders.filter((r) => r.scheduled_at.startsWith(date));
    const confirmed = dayReminders.filter((r) => r.confirmed_at).length;
    const total = dayReminders.length;
    return { date, confirmed, total, pct: total > 0 ? (confirmed / total) * 100 : 100 };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Etterlevelse siste 7 dager</h3>
      <div className="flex items-end justify-between gap-2 h-24">
        {dayStats.map((d) => (
          <div key={d.date} className="flex flex-col items-center flex-1">
            <span className="text-xs text-gray-500 mb-1">{Math.round(d.pct)}%</span>
            <div
              className={`w-full rounded-t-lg transition-all ${
                d.pct >= 80 ? "bg-green-400" : d.pct >= 50 ? "bg-yellow-400" : "bg-red-400"
              }`}
              style={{ height: `${d.pct}%` }}
            />
            <span className="text-xs text-gray-400 mt-1">
              {new Date(d.date).toLocaleDateString("no-NO", { weekday: "short" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [meds, rems] = await Promise.all([
        apiFetch<Medication[]>("/medications"),
        apiFetch<Reminder[]>("/reminders"),
      ]);
      setMedications(meds);
      setReminders(rems);

      if (meds.length >= 2) {
        const ints = await apiFetch<Interaction[]>("/medications/interactions", {
          method: "POST",
          body: JSON.stringify({ medication_ids: meds.map((m) => m.id) }),
        });
        setInteractions(ints);
      }
    } catch {
      console.error("Failed to load medication data");
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const confirmReminder = async (id: string) => {
    await apiFetch(`/reminders/${id}/confirm`, { method: "PUT" });
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, confirmed_at: new Date().toISOString() } : r));
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <h1 className="text-xl font-bold text-gray-900">MediWise</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <PendingReminders reminders={reminders} onConfirm={confirmReminder} />
        <InteractionAlerts interactions={interactions} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedicationsList medications={medications} />
          <AdherenceChart reminders={reminders} />
        </div>
      </div>
    </main>
  );
}
