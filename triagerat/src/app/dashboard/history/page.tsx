"use client";

import { useEffect, useState } from "react";
import HistoryTable from "@/components/HistoryTable";
import type { DbActionHistory } from "@/lib/types";

interface HistoryRow extends DbActionHistory {
  issues: { number: number; title: string; html_url: string } | null;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load history.");
        setRows(data.history ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-900">History</h1>
      <p className="mt-1 text-sm text-slate-500">Audit log of every action TriageRat has applied to GitHub.</p>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="mt-4">
          <HistoryTable rows={rows} />
        </div>
      )}
    </div>
  );
}
