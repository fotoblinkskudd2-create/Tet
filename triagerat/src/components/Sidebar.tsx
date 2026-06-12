import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inbox" },
  { href: "/dashboard/bulk", label: "Bulk approve" },
  { href: "/dashboard/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-2">
        <span className="text-2xl">🐀</span>
        <span className="text-lg font-semibold text-slate-900">TriageRat</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-slate-400">
        <p>Dry-run by default.</p>
        <p>Nothing is posted to GitHub without your approval.</p>
      </div>
    </aside>
  );
}
