// AquaPure Web — Vannkvalitetsdashboard med kart, sensordata og rapporter (Next.js 14)
"use client";

import { useState, useEffect, useCallback } from "react";

interface WaterReport {
  id: string;
  lat: number;
  lng: number;
  type: string;
  severity: number;
  description: string;
  verified: boolean;
  created_at: string;
}

interface SensorReading {
  sensor_id: string;
  timestamp: string;
  ph: number;
  chlorine: number;
  turbidity: number;
  bacteria_count: number;
  temp: number;
}

interface QualityOverview {
  safety_level: "safe" | "moderate" | "unsafe";
  ph: number;
  chlorine: number;
  turbidity: number;
  last_updated: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function SeverityBadge({ level }: { level: number }) {
  const color =
    level <= 2 ? "bg-green-100 text-green-800" :
    level <= 5 ? "bg-yellow-100 text-yellow-800" :
    level <= 7 ? "bg-orange-100 text-orange-800" :
    "bg-red-100 text-red-800";

  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{level}/10</span>;
}

function SafetyCard({ quality }: { quality: QualityOverview }) {
  const cfg = {
    safe: { bg: "bg-green-50 border-green-200", icon: "✅", label: "Trygt vann", desc: "Alle målinger innenfor trygge grenser" },
    moderate: { bg: "bg-yellow-50 border-yellow-200", icon: "⚠️", label: "Vær forsiktig", desc: "Noen avvik oppdaget" },
    unsafe: { bg: "bg-red-50 border-red-200", icon: "🚨", label: "Utrygt", desc: "Vannkvaliteten er under sikre nivåer" },
  }[quality.safety_level];

  return (
    <div className={`rounded-2xl border p-6 ${cfg.bg}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{cfg.icon}</span>
        <div>
          <h3 className="text-lg font-bold">{cfg.label}</h3>
          <p className="text-sm text-gray-600">{cfg.desc}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Metric label="pH" value={quality.ph.toFixed(1)} target="6.5–8.5" ok={quality.ph >= 6.5 && quality.ph <= 8.5} />
        <Metric label="Klorin (mg/L)" value={quality.chlorine.toFixed(2)} target="0.2–0.5" ok={quality.chlorine >= 0.2 && quality.chlorine <= 0.5} />
        <Metric label="Turbiditet (NTU)" value={quality.turbidity.toFixed(1)} target="< 4" ok={quality.turbidity < 4} />
      </div>
    </div>
  );
}

function Metric({ label, value, target, ok }: { label: string; value: string; target: string; ok: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${ok ? "text-green-700" : "text-red-700"}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">Mål: {target}</p>
    </div>
  );
}

function ReportsList({ reports }: { reports: WaterReport[] }) {
  const typeLabels: Record<string, string> = {
    contamination: "🧪 Forurensning",
    taste: "👅 Dårlig smak",
    odor: "👃 Lukt",
    disease: "🤒 Sykdom",
    shortage: "🏜️ Mangel",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Siste rapporter</h3>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {reports.map((r) => (
          <div key={r.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{typeLabels[r.type] || r.type}</span>
                  <SeverityBadge level={r.severity} />
                  {r.verified && <span className="text-xs text-green-600">✓ Verifisert</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {new Date(r.created_at).toLocaleDateString("no-NO")}
              </span>
            </div>
          </div>
        ))}
        {reports.length === 0 && <p className="p-4 text-gray-400 text-sm text-center">Ingen rapporter</p>}
      </div>
    </div>
  );
}

function SensorChart({ readings }: { readings: SensorReading[] }) {
  const maxPH = 14;
  const last24 = readings.slice(-24);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Sensor — pH siste 24 timer</h3>
      <div className="flex items-end gap-1 h-32">
        {last24.map((r, i) => {
          const height = (r.ph / maxPH) * 100;
          const safe = r.ph >= 6.5 && r.ph <= 8.5;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${safe ? "bg-blue-400" : "bg-red-400"}`}
              style={{ height: `${height}%` }}
              title={`pH ${r.ph.toFixed(1)} @ ${new Date(r.timestamp).toLocaleTimeString("no-NO")}`}
              role="img"
              aria-label={`pH ${r.ph.toFixed(1)}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">24t siden</span>
        <span className="text-xs text-gray-400">Nå</span>
      </div>
    </div>
  );
}

function ReportForm({ onSubmit }: { onSubmit: () => void }) {
  const [type, setType] = useState("contamination");
  const [severity, setSeverity] = useState(5);
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const types = [
    { value: "contamination", label: "Forurensning" },
    { value: "taste", label: "Dårlig smak" },
    { value: "odor", label: "Lukt" },
    { value: "disease", label: "Sykdom" },
    { value: "shortage", label: "Vannmangel" },
  ];

  const submit = async () => {
    setSubmitting(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          type, severity, description: desc,
        }),
      });
      setDesc("");
      onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Rapporter vannproblem</h3>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                type === t.value ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-sm text-gray-600">Alvorlighetsgrad: {severity}/10</label>
          <input
            type="range" min={1} max={10} value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <textarea
          value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Beskriv hva du observerer…"
          className="w-full p-3 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-300 focus:outline-none"
          rows={3}
        />
        <button
          onClick={submit} disabled={submitting || !desc.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
        >
          {submitting ? "Sender…" : "Send rapport"}
        </button>
      </div>
    </div>
  );
}

export default function QualityDashboard() {
  const [quality, setQuality] = useState<QualityOverview | null>(null);
  const [reports, setReports] = useState<WaterReport[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [q, r] = await Promise.all([
        apiFetch<QualityOverview>("/quality?lat=-6.8&lng=37.7"),
        apiFetch<WaterReport[]>("/reports?lat=-6.8&lng=37.7&r=10"),
      ]);
      setQuality(q);
      setReports(r);
    } catch {
      console.error("Failed to load data");
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <main className="min-h-screen bg-[#F0F8FF]">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <h1 className="text-xl font-bold text-gray-900">AquaPure</h1>
          <span className="text-sm text-gray-500 ml-auto">Vannkvalitet i sanntid</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {quality && <SafetyCard quality={quality} />}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportsList reports={reports} />
          <div className="space-y-6">
            <SensorChart readings={readings} />
            <ReportForm onSubmit={loadData} />
          </div>
        </div>
      </div>
    </main>
  );
}
