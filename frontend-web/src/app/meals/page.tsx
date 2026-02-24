"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import MealCard from "@/components/MealCard";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

export default function MealsPage() {
  const router = useRouter();
  const { token } = useUserStore();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadPlan();
  }, [token]);

  async function loadPlan() {
    if (!token) return;
    try {
      const data = await api.meals.getPlan(token);
      setPlan(data);
    } catch {
      // No plan yet
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!token) return;
    setGenerating(true);
    try {
      const data = await api.meals.generate(token);
      setPlan(data);
    } catch (err: any) {
      alert(err.message || "Kunne ikke generere plan");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">
          Laster måltidsplan...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pt-16">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Måltidsplan</h1>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {generating ? "Genererer..." : "Ny plan"}
          </button>
        </div>

        {plan?.meals ? (
          <div className="grid md:grid-cols-2 gap-4">
            {(plan.meals as any[]).map((day: any) => (
              <MealCard
                key={day.day}
                day={day.day}
                meals={day.meals}
                totalCalories={day.totalCalories}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <h2 className="font-semibold text-lg mb-2">
              Ingen måltidsplan ennå
            </h2>
            <p className="text-slate-500 mb-6">
              Generer en personlig ukesplan basert på dine mål og preferanser.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-50"
            >
              {generating ? "Genererer..." : "Generer måltidsplan"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
