import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { nb } from '../i18n/nb';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await login(email, password);
    } catch {
      // error is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">BergenBudget</h1>
        <p className="auth-subtitle">Logg inn for a se din okonomi</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{nb.auth.email}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.no"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{nb.auth.password}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minst 8 tegn"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? nb.auth.loggingIn : nb.auth.loginButton}
          </button>
        </form>

        <div className="auth-divider">eller</div>

        <button className="btn btn-google" disabled>
          {nb.auth.googleLogin}
        </button>

        <div className="auth-footer">
          {nb.auth.noAccount}{' '}
          <Link to="/registrer">{nb.auth.register}</Link>
        </div>
      </div>
    </div>
  );
}
