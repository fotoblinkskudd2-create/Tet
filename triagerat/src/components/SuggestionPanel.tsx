"use client";

import { useState } from "react";
import type { ApprovalActions, ApprovePreviewItem, DbIssue, DbTriageSuggestion } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import { CategoryBadge, LabelBadge } from "./LabelBadge";

interface SuggestionPanelProps {
  issue: DbIssue;
  suggestion: DbTriageSuggestion;
  onChanged?: () => void;
}

const DEFAULT_ACTIONS: ApprovalActions = {
  addLabels: true,
  postMaintainerResponse: true,
  postReproductionRequest: false,
  closeIssue: false,
};

export default function SuggestionPanel({ issue, suggestion, onChanged }: SuggestionPanelProps) {
  const [maintainerResponse, setMaintainerResponse] = useState(suggestion.maintainer_response ?? "");
  const [reproductionRequest, setReproductionRequest] = useState(suggestion.reproduction_request ?? "");
  const [actions, setActions] = useState<ApprovalActions>({
    ...DEFAULT_ACTIONS,
    postReproductionRequest: Boolean(suggestion.reproduction_request),
    postMaintainerResponse: !suggestion.is_security,
  });
  const [preview, setPreview] = useState<ApprovePreviewItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFinal = suggestion.status === "applied" || suggestion.status === "rejected";

  async function saveEdits() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/suggestions/${suggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintainer_response: maintainerResponse,
          reproduction_request: reproductionRequest || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save edits.");
      setMessage("Draft saved.");
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save edits.");
    } finally {
      setSaving(false);
    }
  }

  async function runApprove(dryRun: boolean, reject = false) {
    setWorking(true);
    setError(null);
    setMessage(null);
    if (!reject) setPreview(null);
    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: suggestion.id, actions, dryRun, reject }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Approval request failed.");

      if (dryRun) {
        setPreview(data.preview ?? []);
      } else if (reject) {
        setMessage("Suggestion rejected. No changes were made on GitHub.");
        onChanged?.();
      } else {
        setMessage("Approved actions applied to GitHub.");
        setPreview(null);
        onChanged?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval request failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={suggestion.category} />
        <PriorityBadge priority={suggestion.priority} />
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
          Status: {suggestion.status}
        </span>
        {suggestion.suggested_assignee_type && (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
            Assignee: {suggestion.suggested_assignee_type}
          </span>
        )}
      </div>

      {suggestion.is_security && (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">Security concern detected</p>
          <p className="mt-1">
            TriageRat will not post maintainer responses or reproduction requests publicly for this issue.
            Handle this report through a private security disclosure channel.
          </p>
        </div>
      )}

      {suggestion.suggested_labels.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Suggested labels</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {suggestion.suggested_labels.map((label) => (
              <LabelBadge key={label} label={label} />
            ))}
          </div>
        </div>
      )}

      {suggestion.duplicate_of && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Possible duplicate of issue #{suggestion.duplicate_of}
          {suggestion.duplicate_confidence != null && (
            <> ({Math.round(suggestion.duplicate_confidence * 100)}% confidence)</>
          )}
          .
        </div>
      )}

      {suggestion.rationale && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">AI rationale (internal only)</h3>
          <p className="mt-1 text-sm text-slate-600">{suggestion.rationale}</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-700">Maintainer response (draft)</h3>
        <textarea
          className="mt-2 w-full rounded-md border border-slate-300 p-2 text-sm"
          rows={5}
          value={maintainerResponse}
          onChange={(event) => setMaintainerResponse(event.target.value)}
          disabled={isFinal}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">Reproduction request (draft)</h3>
        <textarea
          className="mt-2 w-full rounded-md border border-slate-300 p-2 text-sm"
          rows={4}
          placeholder="(none suggested)"
          value={reproductionRequest}
          onChange={(event) => setReproductionRequest(event.target.value)}
          disabled={isFinal}
        />
      </div>

      {!isFinal && (
        <button
          onClick={saveEdits}
          disabled={saving}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save draft edits"}
        </button>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-700">Actions to apply on approval</h3>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={actions.addLabels}
              disabled={isFinal || suggestion.suggested_labels.length === 0}
              onChange={(event) => setActions((prev) => ({ ...prev, addLabels: event.target.checked }))}
            />
            Add suggested labels
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={actions.postMaintainerResponse}
              disabled={isFinal || suggestion.is_security}
              onChange={(event) => setActions((prev) => ({ ...prev, postMaintainerResponse: event.target.checked }))}
            />
            Post maintainer response comment
            {suggestion.is_security && <span className="text-rose-600"> (blocked for security issues)</span>}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={actions.postReproductionRequest}
              disabled={isFinal || suggestion.is_security || !suggestion.reproduction_request}
              onChange={(event) =>
                setActions((prev) => ({ ...prev, postReproductionRequest: event.target.checked }))
              }
            />
            Post reproduction request comment
            {suggestion.is_security && <span className="text-rose-600"> (blocked for security issues)</span>}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={actions.closeIssue}
              disabled={isFinal}
              onChange={(event) => setActions((prev) => ({ ...prev, closeIssue: event.target.checked }))}
            />
            Close this issue
            <span className="text-slate-400"> (only happens if you check this and approve)</span>
          </label>
        </div>

        {preview && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-700">Dry-run preview - nothing has been sent to GitHub yet:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              {preview.length === 0 && <li>No actions selected.</li>}
              {preview.map((item, idx) => (
                <li key={idx}>{item.description}</li>
              ))}
            </ul>
          </div>
        )}

        {!isFinal && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => runApprove(true)}
              disabled={working}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Preview (dry-run)
            </button>
            <button
              onClick={() => runApprove(false)}
              disabled={working}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Approve &amp; apply to GitHub
            </button>
            <button
              onClick={() => runApprove(false, true)}
              disabled={working}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Reject suggestion
            </button>
          </div>
        )}
      </div>

      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <a
        href={issue.html_url}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm font-medium text-slate-500 underline hover:text-slate-700"
      >
        View issue on GitHub ↗
      </a>
    </div>
  );
}
