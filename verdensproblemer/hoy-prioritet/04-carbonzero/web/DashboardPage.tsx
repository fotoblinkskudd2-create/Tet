// CarbonZero Web — Karbonavtrykk-dashboard med sporing og utfordringer (Next.js 14)
"use client";

import { useState, useEffect, useCallback } from "react";

interface FootprintSummary {
  total_kg: number;
  monthly_avg_kg: number;
  breakdown: { category: string; kg: number; percentage: number }[];
  trend: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  co2_saving_kg: number;
  duration_days: number;
  category: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("cz_token") : null;
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...opts,
  });
  return res.json();
}

const categoryIcons: Record<string, string> = {
  transport: "🚗", food: "🍖", energy: "⚡", shopping: "🛍️", other: "📦",
};

function RingChart({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(value / max, 1) * 100;
  const color = value > max * 0.8 ? "#EF4444" : value > max * 0.5 ? "#F59E0B" : "#22C55E";
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="70" fill="none" stroke="#E5E7EB" strokeWidth="14" />
        <circle
          cx="90" cy="90" r="70" fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 90 90)"
          className="transition-all duration-1000"
        />
        <text x="90" y="82" textAnchor="middle" className="text-3xl font-bold" fill="#1F2937" fontSize="32">
          {Math.round(value)}
        </text>
        <text x="90" y="105" textAnchor="middle" fill="#6B7280" fontSize="14">
          {label}
        </text>
      </svg>
    </div>
  );
}

function BreakdownBar({ category, kg, percentage }: { category: string; kg: number; percentage: number }) {
  const color = percentage > 40 ? "bg-red-500" : percentage > 25 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}</span>
        <span className="font-semibold">{Math.round(kg)} kg ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition min-w-[240px]">
      <span className="text-2xl">{categoryIcons[challenge.category] || "🌱"}</span>
      <h4 className="font-semibold mt-2">{challenge.title}</h4>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{challenge.description}</p>
      <div className="flex items-center gap-1 mt-3 text-green-600">
        <span className="text-sm font-bold">Spar {challenge.co2_saving_kg} kg CO₂</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{challenge.duration_days} dager</p>
      <button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium transition">
        Bli med
      </button>
    </div>
  );
}

function QuickLogger({ onLog }: { onLog: () => void }) {
  const items = [
    { label: "🚗 Biltur 10km", category: "transport", kg: 2.1 },
    { label: "✈️ Fly 1t", category: "transport", kg: 90 },
    { label: "🥩 Biff-middag", category: "food", kg: 6.5 },
    { label: "🥗 Vegetar-dag", category: "food", kg: -1.5 },
    { label: "🚿 Lang dusj", category: "energy", kg: 1.2 },
    { label: "👕 Nytt plagg", category: "shopping", kg: 5.0 },
  ];

  const log = async (item: typeof items[0]) => {
    await apiFetch("/activities", {
      method: "POST",
      body: JSON.stringify({ category: item.category, co2_kg: item.kg, description: item.label }),
    });
    onLog();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Rask logging</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => log(item)}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-green-50 rounded-xl text-sm transition"
          >
            <span>{item.label}</span>
            <span className={`font-bold ${item.kg > 0 ? "text-red-500" : "text-green-500"}`}>
              {item.kg > 0 ? "+" : ""}{item.kg}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<FootprintSummary | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const loadData = useCallback(async () => {
    const [s, c] = await Promise.all([
      apiFetch<FootprintSummary>("/footprint/summary"),
      apiFetch<Challenge[]>("/challenges"),
    ]);
    setSummary(s);
    setChallenges(c);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <main className="min-h-screen bg-[#F0FDF4]">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <h1 className="text-xl font-bold text-gray-900">CarbonZero</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {summary && (
          <>
            <div className="bg-white rounded-2xl border p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <RingChart value={summary.total_kg} max={5000} label="kg CO₂ i år" />
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">Ditt karbonavtrykk</h2>
                <p className="text-gray-500">Månedlig snitt: {Math.round(summary.monthly_avg_kg)} kg</p>
                <p className="text-sm">
                  Trend: <span className={summary.trend === "improving" ? "text-green-600" : "text-gray-600"}>
                    {summary.trend === "improving" ? "📉 Forbedring!" : "📊 Stabilt"}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-800">Fordeling etter kategori</h3>
              {summary.breakdown.map((b) => (
                <BreakdownBar key={b.category} {...b} />
              ))}
            </div>
          </>
        )}

        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Utfordringer for deg</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        </div>

        <QuickLogger onLog={loadData} />
      </div>
    </main>
  );
}
