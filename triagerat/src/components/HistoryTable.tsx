import Link from "next/link";
import type { DbActionHistory } from "@/lib/types";

interface HistoryRow extends DbActionHistory {
  issues: { number: number; title: string; html_url: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  add_labels: "Added labels",
  post_comment: "Posted maintainer response",
  post_reproduction_request: "Posted reproduction request",
  close_issue: "Closed issue",
  reject: "Rejected suggestion",
};

export default function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No actions have been applied yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">When</th>
            <th className="px-3 py-2">Issue</th>
            <th className="px-3 py-2">Action</th>
            <th className="px-3 py-2">Result</th>
            <th className="px-3 py-2">By</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-2 text-slate-500">{new Date(row.performed_at).toLocaleString()}</td>
              <td className="px-3 py-2">
                {row.issues ? (
                  <Link href={`/dashboard/${row.issues.number}`} className="font-medium text-slate-800 hover:underline">
                    #{row.issues.number} {row.issues.title}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-3 py-2">{ACTION_LABELS[row.action_type] ?? row.action_type}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    row.result === "success"
                      ? "text-emerald-700"
                      : row.result === "error"
                        ? "text-red-700"
                        : "text-slate-500"
                  }
                >
                  {row.result}
                  {row.error_message ? `: ${row.error_message}` : ""}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-500">{row.performed_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
