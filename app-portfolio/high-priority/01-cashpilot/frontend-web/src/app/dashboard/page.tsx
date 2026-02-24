// CashPilot Web — Dashboard med brukerdata, leksjoner, budsjett og AI-chat
"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  streakDays: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  durationMinutes: number;
}

interface Progress {
  totalXp: number;
  level: number;
  streakDays: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.cashpilot.app/v1";

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cashpilot_token") || "demo_token";
    Promise.all([
      apiFetch<User>("/users/me", token),
      apiFetch<Lesson[]>("/lessons/recommended", token),
      apiFetch<Progress>("/progress", token),
    ])
      .then(([u, l, p]) => {
        setUser(u);
        setLessons(l);
        setProgress(p);
      })
      .catch(() => {
        setUser({ id: "demo", name: "Maria", level: 5, totalXp: 1250, streakDays: 7 });
        setLessons([
          { id: "1", title: "Hva er inflasjon?", description: "Lær hvorfor prisene stiger", category: "basics", difficulty: "beginner", xpReward: 50, durationMinutes: 5 },
          { id: "2", title: "Renters rente", description: "Kraften i compound interest", category: "investing", difficulty: "intermediate", xpReward: 75, durationMinutes: 7 },
          { id: "3", title: "Budsjettering 101", description: "Lag ditt første budsjett", category: "budgeting", difficulty: "beginner", xpReward: 50, durationMinutes: 4 },
        ]);
        setProgress({ totalXp: 1250, level: 5, streakDays: 7, lessonsCompleted: 12, lessonsTotal: 20 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const pct = progress ? Math.round((progress.lessonsCompleted / progress.lessonsTotal) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      {user && (
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            God morgen, {user.name}!
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="text-blue-600 font-semibold">⭐ Level {user.level}</span>
            <span>·</span>
            <span>{user.totalXp} XP</span>
            <span>·</span>
            <span className="text-orange-500">🔥 {user.streakDays} dager</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{pct}% fullført</p>
          </div>
        </section>
      )}

      {/* Next Lessons */}
      <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📚 Neste leksjoner</h2>
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <a
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>⏱ {lesson.durationMinutes} min</span>
                  <span>✨ {lesson.xpReward} XP</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor[lesson.difficulty]}`}>
                    {lesson.difficulty}
                  </span>
                </div>
              </div>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* Budget Summary */}
      <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">💰 Budsjett denne måneden</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-emerald-500 h-4 rounded-full" style={{ width: "68%" }} />
        </div>
        <p className="text-sm text-gray-500 mt-2">kr 13,600 / kr 20,000 (68%)</p>
      </section>

      {/* Challenges */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 Utfordringer</h2>
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
          <span className="font-medium">30-dagers sparesprint</span>
          <span className="font-bold text-orange-600">12/30</span>
        </div>
      </section>
    </main>
  );
}
