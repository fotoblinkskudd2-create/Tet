"use client";

interface BulkActionBarProps {
  selectedCount: number;
  working: boolean;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function BulkActionBar({ selectedCount, working, onPreview, onApprove, onReject }: BulkActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
      <span className="text-sm text-slate-600">{selectedCount} selected</span>
      <button
        onClick={onPreview}
        disabled={working || selectedCount === 0}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        Preview (dry-run)
      </button>
      <button
        onClick={onApprove}
        disabled={working || selectedCount === 0}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        Approve &amp; apply selected
      </button>
      <button
        onClick={onReject}
        disabled={working || selectedCount === 0}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Reject selected
      </button>
      <span className="text-xs text-slate-400">
        Default actions: add suggested labels + post maintainer response (security issues skip the public comment).
      </span>
    </div>
  );
}
