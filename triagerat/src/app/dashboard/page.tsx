"use client";

import { useEffect, useState } from "react";
import IssueCard from "@/components/IssueCard";
import type { IssueWithSuggestion, SuggestionStatus } from "@/lib/types";

const STATUS_FILTERS: { label: string; value: SuggestionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Applied", value: "applied" },
  { label: "Rejected", value: "rejected" },
];

export default function DashboardPage() {
  const [issues, setIssues] = useState<IssueWithSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);
  const [filter, setFilter] = useState<SuggestionStatus | "all">("pending");

  async function loadIssues() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/issues");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load issues.");
      setIssues(data.issues ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    setSyncSummary(null);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Sync failed.");
      setSyncSummary(
        `Fetched ${data.fetched} issues · triaged ${data.triaged} · skipped ${data.skipped}` +
          (data.errors?.length ? ` · ${data.errors.length} errors` : "")
      );
      await loadIssues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    if (filter === "all") return true;
    const suggestion = issue.triage_suggestions?.[0];
    return suggestion?.status === filter;
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inbox</h1>
          <p className="mt-1 text-sm text-slate-500">
            Issues synced from GitHub with AI-suggested triage. Nothing here has been posted back to GitHub.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync issues"}
        </button>
      </div>

      {syncSummary && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{syncSummary}</p>
      )}
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === item.value ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading issues...</p>}
        {!loading && filteredIssues.length === 0 && (
          <p className="text-sm text-slate-500">
            No issues to show. Try clicking "Sync issues" to fetch the latest from GitHub.
          </p>
        )}
        {filteredIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
