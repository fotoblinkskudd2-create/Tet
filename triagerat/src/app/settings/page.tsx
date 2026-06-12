"use client";

import { useEffect, useState } from "react";

interface ConfigDisplay {
  repoFullName: string;
  hasGithubToken: boolean;
  hasAnthropicKey: boolean;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigDisplay | null>(null);
  const [repoFullName, setRepoFullName] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/config");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load config.");
        setConfig(data.config);
        setRepoFullName(data.config.repoFullName ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load config.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName, githubToken, anthropicApiKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save config.");
      setMessage("Settings saved.");
      setGithubToken("");
      setAnthropicApiKey("");
      const refreshed = await fetch("/api/config");
      setConfig((await refreshed.json()).config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Configure the repository TriageRat should triage. Tokens and keys are stored in Supabase and only used
        server-side. Leave a credential field blank to keep the current value (or fall back to environment
        variables).
      </p>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {!loading && (
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Repository (owner/repo or URL)</label>
            <input
              type="text"
              value={repoFullName}
              onChange={(event) => setRepoFullName(event.target.value)}
              placeholder="octocat/hello-world"
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">GitHub token</label>
            <input
              type="password"
              value={githubToken}
              onChange={(event) => setGithubToken(event.target.value)}
              placeholder={config?.hasGithubToken ? "•••••••• (already set)" : "ghp_..."}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Anthropic API key</label>
            <input
              type="password"
              value={anthropicApiKey}
              onChange={(event) => setAnthropicApiKey(event.target.value)}
              placeholder={config?.hasAnthropicKey ? "•••••••• (already set)" : "sk-ant-..."}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      )}

      {message && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-8 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <h2 className="font-semibold text-slate-700">Safety reminders</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Sync only classifies issues - it never writes to GitHub.</li>
          <li>Every label, comment, or close action requires explicit approval on the dashboard.</li>
          <li>Issues flagged "Security concern" can never get a public comment from TriageRat.</li>
          <li>Closing an issue only happens if you tick "Close this issue" and approve.</li>
        </ul>
      </div>
    </div>
  );
}
