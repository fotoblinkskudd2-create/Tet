import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api';
import { PublicUser } from '../../lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await apiFetch<PublicUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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
      <h1>Logg inn</h1>
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
          Passord
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Logger inn...' : 'Logg inn'}
        </button>
      </form>

      {message && <p className="status">{message}</p>}

      <p>
        Ingen konto? <Link href="/auth/signup">Opprett bruker</Link>
      </p>
    </div>
  );
}
