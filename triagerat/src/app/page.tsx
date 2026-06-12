import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome to TriageRat</h1>
      <p className="mt-2 text-slate-600">
        An AI-assisted triage dashboard for GitHub issues. Sync issues, review suggested labels,
        priorities, and draft responses, then approve actions individually or in bulk - nothing is
        written back to GitHub until you say so.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Open Inbox
        </Link>
        <Link
          href="/settings"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Configure repo
        </Link>
      </div>
    </div>
  );
}
