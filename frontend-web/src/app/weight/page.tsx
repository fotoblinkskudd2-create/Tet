"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import WeightChart from "@/components/WeightChart";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

export default function WeightPage() {
  const router = useRouter();
  const { token } = useUserStore();
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    try {
      const [w, s] = await Promise.all([
        api.weight.getEntries(token, thirtyDaysAgo, today),
        api.weight.getStats(token).catch(() => null),
      ]);
      setEntries(w);
      setStats(s);
    } catch {
      // first use
    }
  }

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !weight) return;
    setSubmitting(true);
    setMessage("");

    try {
      await api.weight.log(token, {
        weightKg: parseFloat(weight),
        date: new Date().toISOString().slice(0, 10),
        note: note || undefined,
      });
      setWeight("");
      setNote("");
      setMessage("Vekt logget!");
      loadData();
    } catch (err: any) {
      setMessage(err.message || "Feil ved logging");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pt-16">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Vektlogg</h1>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Nåværende" value={`${stats.current} kg`} />
            <StatCard label="Mål" value={`${stats.goal} kg`} />
            <StatCard
              label="Totalt endring"
              value={`${stats.totalChange > 0 ? "+" : ""}${stats.totalChange} kg`}
              color={stats.totalChange <= 0 ? "text-primary-600" : "text-red-500"}
            />
            <StatCard label="BMI" value={stats.bmi.toString()} />
          </div>
        )}

        {/* Weight chart */}
        {entries.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-slate-700 mb-4">
              Siste 30 dager
            </h2>
            <WeightChart entries={entries} goalWeight={stats?.goal} />
          </div>
        )}

        {/* Log form */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Logg vekt</h2>
          <form onSubmit={handleLog} className="space-y-4">
            <div>
              <label className="text-sm text-slate-600">Vekt (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="f.eks. 82.5"
                className="w-full border rounded-lg px-3 py-2.5 text-sm mt-1 font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                required
                aria-label="Vekt i kilogram"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Notat (valgfritt)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Etter frokost, etc."
                className="w-full border rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-primary-500 outline-none"
                aria-label="Notat"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
            >
              {submitting ? "Logger..." : "Logg vekt"}
            </button>
            {message && (
              <p className="text-sm text-center text-primary-600 font-medium">
                {message}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-slate-800",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`font-mono font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}
