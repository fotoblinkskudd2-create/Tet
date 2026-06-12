import type { IssuePriority } from "@/lib/types";

const STYLES: Record<IssuePriority, string> = {
  P0: "bg-red-100 text-red-800 border-red-300",
  P1: "bg-orange-100 text-orange-800 border-orange-300",
  P2: "bg-blue-100 text-blue-800 border-blue-300",
  P3: "bg-gray-100 text-gray-700 border-gray-300",
};

const LABELS: Record<IssuePriority, string> = {
  P0: "P0 · Critical",
  P1: "P1 · Important",
  P2: "P2 · Normal",
  P3: "P3 · Low",
};

export default function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[priority]}`}>
      {LABELS[priority]}
    </span>
  );
}
