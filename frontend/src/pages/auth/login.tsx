import { useCallback, useId, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface LoginState {
  loading: boolean;
  error: string | null;
}

export default function LoginPage() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<LoginState>({ loading: false, error: null });

  const canSubmit = email.length > 0 && password.length > 0 && !state.loading;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setState({ loading: true, error: null });

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Kunne ikke logge inn');
        }

        router.push(`/profile/${data.id}`);
      } catch (err) {
        setState({ loading: false, error: (err as Error).message });
      }
    },
    [email, password, router],
  );

  return (
    <div className="auth-page">
      <h1>Logg inn</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={emailId}>E-post</label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div className="field">
          <label htmlFor={passwordId}>Passord</label>
          <input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <button type="submit" disabled={!canSubmit} aria-busy={state.loading}>
          {state.loading ? 'Logger inn...' : 'Logg inn'}
        </button>
      </form>

      {state.error && (
        <p className="status error" role="alert">
          {state.error}
        </p>
      )}

      <p>
        Ingen konto? <Link href="/auth/signup">Opprett bruker</Link>
      </p>
    </div>
  );
}
