// MindWell Web — Dashboard-side med humørsporing, AI-chat og øvelser (Next.js 14 + TailwindCSS)
"use client";

import { useState, useEffect, useCallback } from "react";

// --- Types ---

interface MoodEntry {
  id: string;
  score: number;
  emotions: string[];
  note?: string;
  created_at: string;
  ai_suggestion?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

// --- API Client ---

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mw_token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// --- Mood Chart Component ---

function MoodChart({ entries }: { entries: MoodEntry[] }) {
  const last7 = entries.slice(-7);
  const maxScore = 10;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Siste 7 dager</h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {last7.map((entry) => (
          <div key={entry.id} className="flex flex-col items-center flex-1">
            <span className="text-xs text-gray-500 mb-1">{entry.score}</span>
            <div
              className="w-full rounded-t-lg bg-blue-400 transition-all duration-500"
              style={{ height: `${(entry.score / maxScore) * 100}%` }}
              role="img"
              aria-label={`Humør ${entry.score} av 10`}
            />
            <span className="text-xs text-gray-400 mt-1">
              {new Date(entry.created_at).toLocaleDateString("no-NO", { weekday: "short" })}
            </span>
          </div>
        ))}
        {last7.length === 0 && (
          <p className="text-gray-400 text-sm w-full text-center">Ingen data ennå</p>
        )}
      </div>
    </div>
  );
}

// --- Mood Logger Component ---

const EMOTIONS = ["Glad", "Rolig", "Engstelig", "Trist", "Irritert", "Håpefull", "Sliten", "Motivert"];

function MoodLogger({ onLog }: { onLog: (entry: MoodEntry) => void }) {
  const [score, setScore] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (e: string) => {
    const next = new Set(selected);
    next.has(e) ? next.delete(e) : next.add(e);
    setSelected(next);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const entry = await apiFetch<MoodEntry>("/mood", {
        method: "POST",
        body: JSON.stringify({ score, emotions: Array.from(selected), note: note || undefined }),
      });
      onLog(entry);
      setNote("");
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  };

  const moodColor =
    score <= 3 ? "text-red-500" : score <= 6 ? "text-orange-500" : "text-green-500";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Hvordan har du det?</h3>
      <p className={`text-5xl font-bold text-center mb-2 ${moodColor}`}>{score}</p>
      <input
        type="range"
        min={1}
        max={10}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="w-full accent-blue-500"
        aria-label="Humørscore"
      />
      <div className="flex flex-wrap gap-2 mt-4">
        {EMOTIONS.map((e) => (
          <button
            key={e}
            onClick={() => toggle(e)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              selected.has(e)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Noe du vil notere? (valgfritt)"
        className="w-full mt-4 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-300 focus:outline-none"
        rows={2}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
      >
        {loading ? "Lagrer…" : "Lagre humør"}
      </button>
    </div>
  );
}

// --- Quick Chat Component ---

function QuickChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = "sess_" + Date.now();

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await apiFetch<{ response: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({ message: input, session_id: sessionId }),
      });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", content: res.response, timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-96">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Terapeut</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8">
            Si hei — jeg er her for deg 💙
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-gray-500 animate-pulse">
              Skriver…
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Skriv en melding…"
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          aria-label="Chat-melding"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// --- Quick Action Cards ---

function QuickActions() {
  const actions = [
    { icon: "🫁", title: "Pusteøvelse", desc: "4-7-8 teknikk", color: "bg-green-50 border-green-100" },
    { icon: "📓", title: "Journal", desc: "Skriv ned tanker", color: "bg-purple-50 border-purple-100" },
    { icon: "🧘", title: "Body Scan", desc: "10 min meditasjon", color: "bg-orange-50 border-orange-100" },
    { icon: "🆘", title: "Kriselinje", desc: "Trykk for hjelp", color: "bg-red-50 border-red-100" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <button
          key={a.title}
          className={`${a.color} border rounded-2xl p-4 text-left hover:shadow-md transition`}
          aria-label={`${a.title}: ${a.desc}`}
        >
          <span className="text-2xl">{a.icon}</span>
          <p className="font-semibold text-gray-800 mt-2 text-sm">{a.title}</p>
          <p className="text-xs text-gray-500">{a.desc}</p>
        </button>
      ))}
    </div>
  );
}

// --- Main Dashboard Page ---

export default function DashboardPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);

  const loadMoods = useCallback(async () => {
    try {
      const now = new Date();
      const from = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
      const to = now.toISOString().split("T")[0];
      const data = await apiFetch<MoodEntry[]>(`/mood?from=${from}&to=${to}`);
      setMoods(data);
    } catch {
      console.error("Kunne ikke laste humørdata");
    }
  }, []);

  useEffect(() => {
    loadMoods();
  }, [loadMoods]);

  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hei! 👋</h1>
          <p className="text-gray-500 mt-1">Hvordan har du det i dag?</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MoodChart entries={moods} />
            <MoodLogger onLog={(entry) => setMoods((prev) => [...prev, entry])} />
          </div>
          <div className="space-y-6">
            <QuickChat />
            <QuickActions />
          </div>
        </div>
      </div>
    </main>
  );
}
