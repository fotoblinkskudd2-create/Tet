import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

const defaultStats: UserStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Fant ikke bruker');
        }

        const data = await response.json();
        setProfile(data as UserProfile);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const stats = profile?.stats || defaultStats;

  return (
    <div className="profile-page">
      {loading && <p>Laster profil...</p>}
      {error && <p className="error">{error}</p>}
      {profile && !loading && !error && (
        <div>
          <h1>{profile.username}</h1>
          <p>Spiller-ID: {profile.id}</p>
          <p>Rating: {profile.rating}</p>

          <section>
            <h2>Statistikk</h2>
            <ul>
              <li>Kamperspilt: {stats.gamesPlayed}</li>
              <li>Seire: {stats.wins}</li>
              <li>Tap: {stats.losses}</li>
              <li>Uavgjort: {stats.draws}</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
