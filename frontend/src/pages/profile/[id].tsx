import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

interface UserProfile {
  id: string;
  username: string;
  rating: number;
  stats: UserStats;
}

function winRate(stats: UserStats): string {
  if (stats.gamesPlayed === 0) return '—';
  return `${((stats.wins / stats.gamesPlayed) * 100).toFixed(1)}%`;
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; profile: UserProfile }
  | { status: 'error'; message: string };

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState<FetchState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: 'loading' });

    fetch(`/api/users/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Fant ikke bruker');
        const data: UserProfile = await res.json();
        if (!controller.signal.aborted) {
          setState({ status: 'ok', profile: data });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: (err as Error).message });
      });

    return () => controller.abort();
  }, [id]);

  return (
    <div className="profile-page">
      {state.status === 'loading' && <p aria-live="polite">Laster profil...</p>}

      {state.status === 'error' && (
        <p className="error" role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'ok' && (
        <article>
          <h1>{state.profile.username}</h1>
          <dl className="profile-meta">
            <dt>Spiller-ID</dt>
            <dd>{state.profile.id}</dd>
            <dt>Rating</dt>
            <dd>{state.profile.rating}</dd>
          </dl>

          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading">Statistikk</h2>
            <dl className="stats-grid">
              <dt>Kamper spilt</dt>
              <dd>{state.profile.stats.gamesPlayed}</dd>
              <dt>Seire</dt>
              <dd>{state.profile.stats.wins}</dd>
              <dt>Tap</dt>
              <dd>{state.profile.stats.losses}</dd>
              <dt>Uavgjort</dt>
              <dd>{state.profile.stats.draws}</dd>
              <dt>Seiersprosent</dt>
              <dd>{winRate(state.profile.stats)}</dd>
            </dl>
          </section>
        </article>
      )}
    </div>
  );
}
