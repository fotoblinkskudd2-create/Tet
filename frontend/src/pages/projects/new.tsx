import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api';
import { Project, ProjectStatus } from '../../lib/types';
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../../lib/projectStatus';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planned');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const project = await apiFetch<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name,
          address: address || undefined,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          budget: budget || undefined,
          currentValue: currentValue || undefined,
        }),
      });

      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form">
      <h1>Registrer byggeprosjekt</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Navn
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Adresse
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {PROJECT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Startdato
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>

        <label>
          Sluttdato
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>

        <label>
          Budsjett (kr)
          <input type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>

        <label>
          Nåværende verdi (kr)
          <input
            type="number"
            min="0"
            step="0.01"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Lagrer...' : 'Registrer prosjekt'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
