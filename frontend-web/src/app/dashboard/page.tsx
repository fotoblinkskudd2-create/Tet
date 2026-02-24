"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import CalorieRing from "@/components/CalorieRing";
import WeightChart from "@/components/WeightChart";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

interface DashboardData {
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  target: number;
  weightEntries: { date: string; weightKg: number }[];
  weightStats: { current: number; goal: number; totalChange: number; weeklyChange: number | null } | null;
  todaysMeals: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useUserStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboard();
  }, [token]);

  async function loadDashboard() {
    if (!token) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
        .toISOString()
        .slice(0, 10);

      const [foodLog, profile, weights, weightStats] = await Promise.all([
        api.food.getLog(token, today).catch(() => ({ summary: { calories: 0, protein: 0, carbs: 0, fat: 0 }, logs: [] })),
        api.profile.get(token).catch(() => null),
        api.weight.getEntries(token, thirtyDaysAgo, today).catch(() => []),
        api.weight.getStats(token).catch(() => null),
      ]);

      setData({
        nutrition: foodLog.summary,
        target: profile?.dailyTarget || 2000,
        weightEntries: weights,
        weightStats,
        todaysMeals: foodLog.logs,
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Laster dashboard...</div>
      </div>
    );
  }

  const nutrition = data?.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const target = data?.target || 2000;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pt-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Hei, {user?.name?.split(" ")[0] || "der"}!
            </h1>
            <p className="text-slate-500 text-sm">
              {new Date().toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        {/* Calorie Overview */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Dagens kalorier</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <CalorieRing consumed={nutrition.calories} target={target} />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4 w-full">
              <MacroBar
                label="Protein"
                value={nutrition.protein}
                max={Math.round(target * 0.3 / 4)}
                unit="g"
                color="bg-blue-400"
              />
              <MacroBar
                label="Karbo"
                value={nutrition.carbs}
                max={Math.round(target * 0.45 / 4)}
                unit="g"
                color="bg-amber-400"
              />
              <MacroBar
                label="Fett"
                value={nutrition.fat}
                max={Math.round(target * 0.25 / 9)}
                unit="g"
                color="bg-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Weight Trend */}
        {data?.weightEntries && data.weightEntries.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">Vektutvikling</h2>
              {data.weightStats && (
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-500">
                    Nå:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {data.weightStats.current} kg
                    </span>
                  </span>
                  {data.weightStats.weeklyChange !== null && (
                    <span
                      className={
                        data.weightStats.weeklyChange <= 0
                          ? "text-primary-600"
                          : "text-red-500"
                      }
                    >
                      {data.weightStats.weeklyChange <= 0 ? "↓" : "↑"}{" "}
                      {Math.abs(data.weightStats.weeklyChange)} kg/uke
                    </span>
                  )}
                </div>
              )}
            </div>
            <WeightChart
              entries={data.weightEntries}
              goalWeight={data.weightStats?.goal}
            />
          </div>
        )}

        {/* Today's meals */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold text-slate-700 mb-4">
            Dagens måltider
          </h2>
          {data?.todaysMeals && data.todaysMeals.length > 0 ? (
            <div className="space-y-3">
              {data.todaysMeals.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      {mealTypeLabel(log.mealType)}
                    </p>
                    <p className="text-sm font-medium">{log.food.name}</p>
                    <p className="text-xs text-slate-400">{log.amount}g</p>
                  </div>
                  <span className="font-mono text-sm text-primary-600">
                    {Math.round(
                      (log.food.calories * log.amount) / log.food.servingG
                    )}{" "}
                    kcal
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Ingen mat logget i dag ennå.{" "}
              <a href="/food" className="text-primary-600 font-medium">
                Logg mat
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function MacroBar({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-mono text-slate-600">
          {Math.round(value)}/{max}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function mealTypeLabel(type: string): string {
  const map: Record<string, string> = {
    BREAKFAST: "Frokost",
    LUNCH: "Lunsj",
    DINNER: "Middag",
    SNACK: "Snack",
  };
  return map[type] || type;
}
