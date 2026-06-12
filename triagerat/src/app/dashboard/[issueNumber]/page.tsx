"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SuggestionPanel from "@/components/SuggestionPanel";
import type { IssueWithSuggestion } from "@/lib/types";

export default function IssueDetailPage() {
  const params = useParams<{ issueNumber: string }>();
  const [issue, setIssue] = useState<IssueWithSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/issues/${params.issueNumber}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load issue.");
      setIssue(data.issue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.issueNumber]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to inbox
      </Link>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {issue && (
        <div className="mt-4 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              #{issue.number} {issue.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">by {issue.author ?? "unknown"}</p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">Issue body</h2>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {issue.body || "(no description provided)"}
            </pre>
          </div>

          {issue.triage_suggestions && issue.triage_suggestions.length > 0 ? (
            <SuggestionPanel issue={issue} suggestion={issue.triage_suggestions[0]} onChanged={load} />
          ) : (
            <p className="text-sm text-slate-500">
              No triage suggestion yet. Go to the inbox and click "Sync issues" to generate one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
