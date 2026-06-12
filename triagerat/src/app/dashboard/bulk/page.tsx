"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BulkActionBar from "@/components/BulkActionBar";
import { CategoryBadge } from "@/components/LabelBadge";
import PriorityBadge from "@/components/PriorityBadge";
import type { ApprovalActions, IssueWithSuggestion } from "@/lib/types";

export default function BulkApprovePage() {
  const [issues, setIssues] = useState<IssueWithSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultLines, setResultLines] = useState<string[] | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/issues?status=pending");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load issues.");
      setIssues(data.issues ?? []);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggle(suggestionId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(suggestionId)) next.delete(suggestionId);
      else next.add(suggestionId);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === issues.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(issues.map((issue) => issue.triage_suggestions![0].id)));
    }
  }

  function actionsFor(issue: IssueWithSuggestion): ApprovalActions {
    const suggestion = issue.triage_suggestions![0];
    return {
      addLabels: suggestion.suggested_labels.length > 0,
      postMaintainerResponse: !suggestion.is_security,
      postReproductionRequest: false,
      closeIssue: false,
    };
  }

  async function runBulk(dryRun: boolean, reject = false) {
    setWorking(true);
    setError(null);
    setResultLines(null);
    const lines: string[] = [];

    try {
      for (const issue of issues) {
        const suggestion = issue.triage_suggestions?.[0];
        if (!suggestion || !selected.has(suggestion.id)) continue;

        const response = await fetch("/api/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestionId: suggestion.id,
            actions: actionsFor(issue),
            dryRun,
            reject,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          lines.push(`#${issue.number}: error - ${data.error ?? "unknown error"}`);
          continue;
        }

        if (dryRun) {
          const descriptions = (data.preview ?? []).map((item: { description: string }) => item.description);
          lines.push(`#${issue.number}: ${descriptions.length > 0 ? descriptions.join("; ") : "no actions selected"}`);
        } else if (reject) {
          lines.push(`#${issue.number}: rejected`);
        } else {
          lines.push(`#${issue.number}: applied`);
        }
      }

      setResultLines(lines);
      if (!dryRun) await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-900">Bulk approve</h1>
      <p className="mt-1 text-sm text-slate-500">
        Select pending suggestions and apply default actions (add labels + post maintainer response) to all of them
        at once. Security-flagged issues never get a public comment, even in bulk.
      </p>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4">
        <BulkActionBar
          selectedCount={selected.size}
          working={working}
          onPreview={() => runBulk(true)}
          onApprove={() => runBulk(false)}
          onReject={() => runBulk(false, true)}
        />
      </div>

      {resultLines && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <ul className="space-y-1 text-slate-600">
            {resultLines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={issues.length > 0 && selected.size === issues.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2">Issue</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Security</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && issues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  No pending suggestions.
                </td>
              </tr>
            )}
            {issues.map((issue) => {
              const suggestion = issue.triage_suggestions![0];
              return (
                <tr key={issue.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(suggestion.id)} onChange={() => toggle(suggestion.id)} />
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/dashboard/${issue.number}`} className="font-medium text-slate-800 hover:underline">
                      #{issue.number} {issue.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <CategoryBadge category={suggestion.category} />
                  </td>
                  <td className="px-3 py-2">
                    <PriorityBadge priority={suggestion.priority} />
                  </td>
                  <td className="px-3 py-2">{suggestion.is_security ? "Yes - private only" : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
