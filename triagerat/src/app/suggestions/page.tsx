'use client';

import { useEffect, useState } from 'react';
import ConnectionBar from '@/components/ConnectionBar';
import { CategoryBadge, PriorityBadge, StatusBadge } from '@/components/Badges';
import type { TriageSuggestionRecord } from '@/lib/types';

type CommentAction = 'none' | 'maintainer_response' | 'reproduction_request' | 'duplicate';

type StatusFilter = 'pending' | 'approved' | 'applied' | 'rejected' | 'all';

interface ActionResult {
  suggestionId: string;
  issueNumber: number;
  status: string;
  actions: { type: string; dryRun: boolean; result: string }[];
}

const STATUS_TABS: StatusFilter[] = ['pending', 'approved', 'applied', 'rejected', 'all'];

export default function SuggestionsPage() {
  const [connected, setConnected] = useState(false);
  const [suggestions, setSuggestions] = useState<TriageSuggestionRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [dryRun, setDryRun] = useState(true);
  const [applyLabels, setApplyLabels] = useState(true);
  const [commentAction, setCommentAction] = useState<CommentAction>('none');
  const [confirmPublicSecurityPost, setConfirmPublicSecurityPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResults, setLastResults] = useState<ActionResult[]>([]);

  const checkConnection = async () => {
    const res = await fetch('/api/connection');
    const data = await res.json();
    setConnected(Boolean(data.connected));
    return data.connected;
  };

  const loadSuggestions = async (filter: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const qs = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/suggestions${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke hente forslag');
      setSuggestions(data.suggestions);
      setSelected(new Set());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection().then((isConnected) => {
      if (isConnected) loadSuggestions(statusFilter);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (connected) loadSuggestions(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, connected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(suggestions.map((s) => s.id)));
    }
  };

  const securitySelected = suggestions.some((s) => selected.has(s.id) && s.is_security);

  const submit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    setLastResults([]);
    try {
      const res = await fetch('/api/actions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionIds: Array.from(selected),
          dryRun,
          applyLabels,
          commentAction,
          confirmPublicSecurityPost,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Handling feilet');
      setLastResults(data.results);
      setInfo(dryRun ? 'Dry-run kjørt — ingenting er skrevet til GitHub.' : 'Handlinger utført på GitHub.');
      await loadSuggestions(statusFilter);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/actions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Avvisning feilet');
      await loadSuggestions(statusFilter);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Suggested actions</h1>
      <ConnectionBar />

      {connected && (
        <>
          <div className="mb-4 flex gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  statusFilter === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Bulk action bar */}
          <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Bulk-handling for valgte forslag ({selected.size})</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                Dry-run (forhåndsvis, skriv ikke til GitHub)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={applyLabels} onChange={(e) => setApplyLabels(e.target.checked)} />
                Legg til forslåtte labels
              </label>
              <label className="flex items-center gap-2">
                Kommentar:
                <select
                  value={commentAction}
                  onChange={(e) => setCommentAction(e.target.value as CommentAction)}
                  className="rounded-md border border-gray-300 px-2 py-1"
                >
                  <option value="none">Ingen</option>
                  <option value="maintainer_response">Maintainer response</option>
                  <option value="reproduction_request">Reproduction request</option>
                  <option value="duplicate">Duplicate-kommentar</option>
                </select>
              </label>
            </div>

            {securitySelected && commentAction !== 'none' && !dryRun && (
              <label className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                <input
                  type="checkbox"
                  checked={confirmPublicSecurityPost}
                  onChange={(e) => setConfirmPublicSecurityPost(e.target.checked)}
                />
                Ett eller flere valgte issues er klassifisert som "Security concern". Jeg bekrefter at jeg har
                gjennomgått kommentaren og ønsker å poste den offentlig.
              </label>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={submit}
                disabled={selected.size === 0 || submitting}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {submitting ? 'Jobber...' : dryRun ? `Forhåndsvis (${selected.size})` : `Godkjenn og utfør (${selected.size})`}
              </button>
              <button
                onClick={reject}
                disabled={selected.size === 0 || submitting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Avvis valgte
              </button>
            </div>

            {info && <p className="mt-2 text-sm text-green-700">{info}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {lastResults.length > 0 && (
              <div className="mt-3 space-y-2 rounded-md border border-gray-100 bg-gray-50 p-3 text-xs">
                {lastResults.map((r) => (
                  <div key={r.suggestionId}>
                    <strong>#{r.issueNumber}</strong> → {r.status}
                    <ul className="ml-4 list-disc">
                      {r.actions.map((a, idx) => (
                        <li key={idx}>
                          {a.type} {a.dryRun ? '(dry-run)' : '(live)'}: {a.result}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {loading && <p className="text-sm text-gray-500">Laster forslag...</p>}
          {!loading && suggestions.length === 0 && (
            <p className="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              Ingen forslag med status &quot;{statusFilter}&quot;. Gå til Inbox og kjør triage på noen issues.
            </p>
          )}

          {suggestions.length > 0 && (
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={selected.size === suggestions.length} onChange={toggleAll} />
              Velg alle ({suggestions.length})
            </div>
          )}

          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={s.issue_url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                        #{s.issue_number} {s.issue_title}
                      </a>
                      <CategoryBadge category={s.category} />
                      <PriorityBadge priority={s.priority} />
                      <StatusBadge status={s.status} />
                      {s.is_security && (
                        <span className="rounded-full border border-red-400 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                          🔒 Security
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">{s.rationale}</p>

                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-gray-700">Forslåtte labels: </span>
                        {s.suggested_labels?.length ? s.suggested_labels.join(', ') : '—'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Foreslått ansvarlig: </span>
                        {s.suggested_assignee_type}
                      </div>
                      {s.duplicate_of_issue_number && (
                        <div className="sm:col-span-2">
                          <span className="font-medium text-gray-700">Mulig duplikat av: </span>
                          #{s.duplicate_of_issue_number} (confidence {s.duplicate_confidence})
                        </div>
                      )}
                    </div>

                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer font-medium text-gray-700">Maintainer response</summary>
                      <p className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-gray-700">{s.maintainer_response}</p>
                    </details>

                    {s.reproduction_request && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer font-medium text-gray-700">Reproduction request</summary>
                        <p className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-gray-700">{s.reproduction_request}</p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
