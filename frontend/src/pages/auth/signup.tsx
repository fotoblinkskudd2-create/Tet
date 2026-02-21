import { useCallback, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

interface SignupState {
  loading: boolean;
  error: string | null;
}

function useFieldValidation(value: string, validate: (v: string) => string | null) {
  const [touched, setTouched] = useState(false);
  const error = useMemo(() => (touched ? validate(value) : null), [touched, value, validate]);
  return { error, onBlur: () => setTouched(true) };
}

export default function SignupPage() {
  const router = useRouter();
  const emailId = useId();
  const usernameId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<SignupState>({ loading: false, error: null });

  const emailField = useFieldValidation(email, useCallback((v: string) => {
    if (!v.includes('@') || v.length < 5) return 'Ugyldig e-postadresse';
    return null;
  }, []));

  const usernameField = useFieldValidation(username, useCallback((v: string) => {
    if (!USERNAME_RE.test(v)) return '3-30 tegn: bokstaver, tall, _ eller -';
    return null;
  }, []));

  const passwordField = useFieldValidation(password, useCallback((v: string) => {
    if (v.length < MIN_PASSWORD_LENGTH) return `Minst ${MIN_PASSWORD_LENGTH} tegn`;
    return null;
  }, []));

  const hasClientErrors = !!(emailField.error || usernameField.error || passwordField.error);
  const canSubmit =
    email.length > 0 &&
    username.length > 0 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    !hasClientErrors &&
    !state.loading;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSubmit) return;
      setState({ loading: true, error: null });

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email: email.trim(), username: username.trim(), password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Kunne ikke opprette bruker');
        }

        router.push(`/profile/${data.id}`);
      } catch (err) {
        setState({ loading: false, error: (err as Error).message });
      }
    },
    [canSubmit, email, username, password, router],
  );

  return (
    <div className="auth-page">
      <h1>Opprett konto</h1>

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
            onBlur={emailField.onBlur}
            required
            aria-required="true"
            aria-invalid={!!emailField.error}
          />
          {emailField.error && <span className="field-error" role="alert">{emailField.error}</span>}
        </div>

        <div className="field">
          <label htmlFor={usernameId}>Brukernavn</label>
          <input
            id={usernameId}
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={usernameField.onBlur}
            required
            aria-required="true"
            aria-invalid={!!usernameField.error}
          />
          {usernameField.error && <span className="field-error" role="alert">{usernameField.error}</span>}
        </div>

        <div className="field">
          <label htmlFor={passwordId}>Passord</label>
          <input
            id={passwordId}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={passwordField.onBlur}
            minLength={MIN_PASSWORD_LENGTH}
            required
            aria-required="true"
            aria-invalid={!!passwordField.error}
          />
          {passwordField.error && <span className="field-error" role="alert">{passwordField.error}</span>}
        </div>

        <button type="submit" disabled={!canSubmit} aria-busy={state.loading}>
          {state.loading ? 'Oppretter...' : 'Opprett konto'}
        </button>
      </form>

      {state.error && (
        <p className="status error" role="alert">
          {state.error}
        </p>
      )}

      <p>
        Allerede bruker? <Link href="/auth/login">Logg inn</Link>
      </p>
    </div>
  );
}
