import type { IssueCategory } from "@/lib/types";

const STYLES: Record<IssueCategory, string> = {
  Bug: "bg-red-50 text-red-700 border-red-200",
  Feature: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Question: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Duplicate: "bg-zinc-50 text-zinc-700 border-zinc-200",
  Invalid: "bg-zinc-50 text-zinc-500 border-zinc-200",
  "Needs reproduction": "bg-amber-50 text-amber-700 border-amber-200",
  "Security concern": "bg-rose-100 text-rose-800 border-rose-300",
  Documentation: "bg-sky-50 text-sky-700 border-sky-200",
};

export function CategoryBadge({ category }: { category: IssueCategory }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[category]}`}>
      {category}
    </span>
  );
}

export function LabelBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
