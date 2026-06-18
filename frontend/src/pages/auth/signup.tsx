import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api';
import { PublicUser } from '../../lib/types';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await apiFetch<PublicUser>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });

      router.push('/');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Opprett konto</h1>
      <form onSubmit={handleSubmit}>
        <label>
          E-post
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Brukernavn
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Passord
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Oppretter...' : 'Opprett konto'}
        </button>
      </form>

      {message && <p className="status">{message}</p>}

      <p>
        Allerede bruker? <Link href="/auth/login">Logg inn</Link>
      </p>
    </div>
  );
}
