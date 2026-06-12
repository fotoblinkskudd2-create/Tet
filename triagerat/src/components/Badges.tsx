import type { IssueCategory, IssuePriority } from '@/lib/types';

const PRIORITY_STYLES: Record<IssuePriority, string> = {
  'P0 critical': 'bg-red-100 text-red-800 border-red-300',
  'P1 important': 'bg-orange-100 text-orange-800 border-orange-300',
  'P2 normal': 'bg-blue-100 text-blue-800 border-blue-300',
  'P3 low': 'bg-gray-100 text-gray-700 border-gray-300',
};

const CATEGORY_STYLES: Record<IssueCategory, string> = {
  Bug: 'bg-rose-100 text-rose-800 border-rose-300',
  Feature: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Question: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  Duplicate: 'bg-slate-100 text-slate-700 border-slate-300',
  Invalid: 'bg-zinc-100 text-zinc-600 border-zinc-300',
  'Needs reproduction': 'bg-amber-100 text-amber-800 border-amber-300',
  'Security concern': 'bg-red-200 text-red-900 border-red-400',
  Documentation: 'bg-sky-100 text-sky-800 border-sky-300',
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority | null }) {
  if (!priority) return <Badge className="bg-gray-50 text-gray-500 border-gray-200">Ikke triaget</Badge>;
  return <Badge className={PRIORITY_STYLES[priority]}>{priority}</Badge>;
}

export function CategoryBadge({ category }: { category: IssueCategory | null }) {
  if (!category) return <Badge className="bg-gray-50 text-gray-500 border-gray-200">—</Badge>;
  return <Badge className={CATEGORY_STYLES[category]}>{category}</Badge>;
}

export function StatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-blue-100 text-blue-800 border-blue-300',
    applied: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-gray-100 text-gray-500 border-gray-300',
  };
  if (!status) return <Badge className="bg-gray-50 text-gray-500 border-gray-200">Ikke triaget</Badge>;
  return <Badge className={styles[status] ?? 'bg-gray-100 text-gray-700 border-gray-300'}>{status}</Badge>;
}
