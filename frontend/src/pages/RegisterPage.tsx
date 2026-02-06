import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { nb } from '../i18n/nb';

export default function RegisterPage() {
  const { register, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (password !== confirmPassword) {
      setLocalError('Passordene stemmer ikke overens');
      return;
    }
    if (password.length < 8) {
      setLocalError('Passordet ma vaere minst 8 tegn');
      return;
    }

    setLoading(true);
    try {
      await register(email, name, password);
    } catch {
      // error is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Opprett konto</h1>
        <p className="auth-subtitle">Kom i gang med BergenBudget</p>

        {(error || localError) && (
          <div className="alert alert-error">{localError || error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{nb.auth.name}</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ola Nordmann"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{nb.auth.email}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.no"
              required
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

          <div className="form-group">
            <label className="form-label">{nb.auth.confirmPassword}</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Gjenta passord"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? nb.auth.registering : nb.auth.registerButton}
          </button>
        </form>

        <div className="auth-footer">
          {nb.auth.hasAccount}{' '}
          <Link to="/logg-inn">{nb.auth.login}</Link>
        </div>
      </div>
    </div>
  );
}
