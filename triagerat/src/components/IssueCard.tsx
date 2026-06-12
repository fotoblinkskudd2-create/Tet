import Link from "next/link";
import type { IssueWithSuggestion } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import { CategoryBadge, LabelBadge } from "./LabelBadge";

export default function IssueCard({ issue }: { issue: IssueWithSuggestion }) {
  const suggestion = issue.triage_suggestions?.[0] ?? null;

  return (
    <Link
      href={`/dashboard/${issue.number}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">
            #{issue.number} {issue.title}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            by {issue.author ?? "unknown"} · {new Date(issue.github_created_at ?? issue.synced_at).toLocaleDateString()}
          </p>
        </div>
        {suggestion && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <PriorityBadge priority={suggestion.priority} />
            <CategoryBadge category={suggestion.category} />
          </div>
        )}
      </div>

      {suggestion?.is_security && (
        <p className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
          Security concern - handle privately, no public posting.
        </p>
      )}

      {suggestion && suggestion.suggested_labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {suggestion.suggested_labels.map((label) => (
            <LabelBadge key={label} label={label} />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {suggestion ? `Suggestion: ${suggestion.status}` : "Not yet triaged"}
        </span>
        {suggestion?.duplicate_of && (
          <span className="text-amber-600">Possible duplicate of #{suggestion.duplicate_of}</span>
        )}
      </div>
    </Link>
  );
}
