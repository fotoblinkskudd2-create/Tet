import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../lib/api';
import { Project } from '../lib/types';
import { PROJECT_STATUS_LABELS } from '../lib/projectStatus';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Project[]>('/api/projects')
      .then(setProjects)
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div>
      <h1>Byggeprosjekter</h1>

      {error && (
        <p className="error">
          {error}. <Link href="/auth/login">Logg inn</Link> for å se prosjektene dine.
        </p>
      )}

      {!error && !projects && <p>Laster prosjekter...</p>}

      {!error && projects && projects.length === 0 && (
        <p>
          Ingen prosjekter registrert ennå. <Link href="/projects/new">Registrer ditt første prosjekt</Link>.
        </p>
      )}

      {projects && projects.length > 0 && (
        <div className="project-list">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="project-card">
              <h3>{project.name}</h3>
              <p className="meta">
                {PROJECT_STATUS_LABELS[project.status]}
                {project.address ? ` · ${project.address}` : ''}
                {project.budget ? ` · Budsjett: ${project.budget}` : ''}
                {project.current_value ? ` · Verdi: ${project.current_value}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
