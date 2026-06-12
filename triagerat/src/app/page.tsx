'use client';

import { useEffect, useState } from 'react';
import ConnectionBar from '@/components/ConnectionBar';
import { CategoryBadge, PriorityBadge, StatusBadge } from '@/components/Badges';
import type { IssueCategory, IssuePriority } from '@/lib/types';

interface InboxIssue {
  number: number;
  title: string;
  url: string;
  author: string | null;
  labels: string[];
  createdAt: string;
  comments: number;
  triageStatus: string | null;
  category: IssueCategory | null;
  priority: IssuePriority | null;
}

export default function InboxPage() {
  const [connected, setConnected] = useState(false);
  const [issues, setIssues] = useState<InboxIssue[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    const res = await fetch('/api/connection');
    const data = await res.json();
    setConnected(Boolean(data.connected));
    return data.connected;
  };

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/issues');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke hente issues');
      setIssues(data.issues);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection().then((isConnected) => {
      if (isConnected) loadIssues();
    });
  }, []);

  const toggle = (num: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === issues.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(issues.map((i) => i.number)));
    }
  };

  const runTriage = async () => {
    if (selected.size === 0) return;
    setTriaging(true);
    setError(null);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueNumbers: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Triage feilet');
      setSelected(new Set());
      await loadIssues();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTriaging(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Inbox</h1>
      <ConnectionBar />

      {connected && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={loadIssues}
                disabled={loading}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Laster...' : 'Oppdater issues'}
              </button>
              {issues.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={selected.size === issues.length} onChange={toggleAll} />
                  Velg alle ({issues.length})
                </label>
              )}
            </div>
            <button
              onClick={runTriage}
              disabled={selected.size === 0 || triaging}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {triaging ? 'Triagerer...' : `Kjør triage (${selected.size})`}
            </button>
          </div>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            {issues.length === 0 && !loading && (
              <p className="p-6 text-center text-sm text-gray-500">Ingen åpne issues funnet.</p>
            )}
            <ul className="divide-y divide-gray-100">
              {issues.map((issue) => (
                <li key={issue.number} className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(issue.number)}
                    onChange={() => toggle(issue.number)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={issue.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                        #{issue.number} {issue.title}
                      </a>
                      <CategoryBadge category={issue.category} />
                      <PriorityBadge priority={issue.priority} />
                      <StatusBadge status={issue.triageStatus} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Åpnet av {issue.author ?? 'unknown'} · {issue.comments} kommentarer
                      {issue.labels.length > 0 ? ` · labels: ${issue.labels.join(', ')}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
