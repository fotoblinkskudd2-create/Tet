import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api';
import { Project, ProjectStatus } from '../../lib/types';
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../../lib/projectStatus';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<Project>(`/api/projects/${id}`)
      .then(setProject)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project) return;
    setSaving(true);
    setError(null);

    try {
      const updated = await apiFetch<Project>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: project.name,
          address: project.address,
          status: project.status,
          startDate: project.start_date,
          endDate: project.end_date,
          budget: project.budget,
          currentValue: project.current_value,
        }),
      });
      setProject(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Slette dette prosjektet?')) return;
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    router.push('/');
  };

  if (loading) return <p>Laster prosjekt...</p>;
  if (error && !project) return <p className="error">{error}</p>;
  if (!project) return null;

  return (
    <div className="project-form">
      <h1>{project.name}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Navn
          <input value={project.name} onChange={(e) => updateField('name', e.target.value)} required />
        </label>

        <label>
          Adresse
          <input value={project.address ?? ''} onChange={(e) => updateField('address', e.target.value)} />
        </label>

        <label>
          Status
          <select value={project.status} onChange={(e) => updateField('status', e.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {PROJECT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Startdato
          <input
            type="date"
            value={project.start_date ?? ''}
            onChange={(e) => updateField('start_date', e.target.value)}
          />
        </label>

        <label>
          Sluttdato
          <input
            type="date"
            value={project.end_date ?? ''}
            onChange={(e) => updateField('end_date', e.target.value)}
          />
        </label>

        <label>
          Budsjett (kr)
          <input
            type="number"
            min="0"
            step="0.01"
            value={project.budget ?? ''}
            onChange={(e) => updateField('budget', e.target.value)}
          />
        </label>

        <label>
          Nåværende verdi (kr)
          <input
            type="number"
            min="0"
            step="0.01"
            value={project.current_value ?? ''}
            onChange={(e) => updateField('current_value', e.target.value)}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Lagrer...' : 'Lagre endringer'}
        </button>
        <button type="button" className="danger" onClick={handleDelete}>
          Slett prosjekt
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
