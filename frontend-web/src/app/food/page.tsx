"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import FoodSearch from "@/components/FoodSearch";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

export default function FoodPage() {
  const router = useRouter();
  const { token } = useUserStore();
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [amount, setAmount] = useState("100");
  const [mealType, setMealType] = useState("LUNCH");
  const [todaysLog, setTodaysLog] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadTodaysLog();
  }, [token]);

  async function loadTodaysLog() {
    if (!token) return;
    try {
      const data = await api.food.getLog(token, today);
      setTodaysLog(data);
    } catch {
      // First day, no data
    }
  }

  async function handleLogFood() {
    if (!token || !selectedFood) return;
    setSubmitting(true);
    setMessage("");

    try {
      await api.food.log(token, {
        foodId: selectedFood.id,
        amount: parseFloat(amount),
        unit: "g",
        mealType,
        date: today,
      });
      setSelectedFood(null);
      setAmount("100");
      setMessage("Mat logget!");
      loadTodaysLog();
    } catch (err: any) {
      setMessage(err.message || "Feil ved logging");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await api.food.deleteLog(token, id);
      loadTodaysLog();
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pt-16">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Logg mat</h1>

        {/* Food Search */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <FoodSearch onSelect={setSelectedFood} />

          {selectedFood && (
            <div className="border rounded-lg p-4 bg-primary-50">
              <p className="font-medium">{selectedFood.name}</p>
              <p className="text-sm text-slate-500">
                {selectedFood.calories} kcal per {selectedFood.servingG}g
              </p>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-slate-500">Mengde (g)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    aria-label="Mengde i gram"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Måltid</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    aria-label="Måltidstype"
                  >
                    <option value="BREAKFAST">Frokost</option>
                    <option value="LUNCH">Lunsj</option>
                    <option value="DINNER">Middag</option>
                    <option value="SNACK">Snack</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Totalt:{" "}
                <span className="font-mono font-semibold">
                  {Math.round(
                    (selectedFood.calories * parseFloat(amount || "0")) /
                      selectedFood.servingG
                  )}{" "}
                  kcal
                </span>
              </div>

              <button
                onClick={handleLogFood}
                disabled={submitting}
                className="mt-3 w-full bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
              >
                {submitting ? "Logger..." : "Logg mat"}
              </button>
            </div>
          )}

          {message && (
            <p className="text-sm text-center text-primary-600 font-medium">
              {message}
            </p>
          )}
        </div>

        {/* Today's Log */}
        {todaysLog && (
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">I dag</h2>
              <span className="font-mono text-sm text-primary-600">
                {todaysLog.summary.calories} kcal totalt
              </span>
            </div>

            {todaysLog.logs.length > 0 ? (
              <div className="space-y-2">
                {todaysLog.logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{log.food.name}</p>
                      <p className="text-xs text-slate-400">
                        {log.amount}g ·{" "}
                        {log.mealType === "BREAKFAST"
                          ? "Frokost"
                          : log.mealType === "LUNCH"
                            ? "Lunsj"
                            : log.mealType === "DINNER"
                              ? "Middag"
                              : "Snack"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">
                        {Math.round(
                          (log.food.calories * log.amount) / log.food.servingG
                        )}{" "}
                        kcal
                      </span>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                        aria-label={`Slett ${log.food.name}`}
                      >
                        Slett
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                Ingen mat logget ennå i dag.
              </p>
            )}

            {todaysLog.summary.calories > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="font-mono font-semibold">{todaysLog.summary.calories}</p>
                  <p className="text-slate-400">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="font-mono font-semibold">{todaysLog.summary.protein}g</p>
                  <p className="text-slate-400">protein</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="font-mono font-semibold">{todaysLog.summary.carbs}g</p>
                  <p className="text-slate-400">karbo</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-2">
                  <p className="font-mono font-semibold">{todaysLog.summary.fat}g</p>
                  <p className="text-slate-400">fett</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
