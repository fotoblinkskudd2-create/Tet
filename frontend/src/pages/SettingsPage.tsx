import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { nb } from '../i18n/nb';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Profile */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">{nb.settings.profile}</div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Navn</label>
            <input type="text" className="form-input" value={user?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">E-post</label>
            <input type="email" className="form-input" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Rolle</label>
            <input type="text" className="form-input" value={user?.role === 'admin' ? 'Administrator' : 'Bruker'} disabled />
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">Visning</div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{nb.settings.darkMode}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bytt mellom lys og mork modus
              </div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? '\u{2600}\u{FE0F} Lys modus' : '\u{1F319} Mork modus'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{nb.settings.language}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grensesnittsprak</div>
            </div>
            <span className="tag">Norsk Bokmal</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{nb.settings.currency}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard valuta</div>
            </div>
            <span className="tag">NOK (kr)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{nb.settings.dateFormat}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Datoformat</div>
            </div>
            <span className="tag">DD.MM.YYYY</span>
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="card">
        <div className="card-header">Om BergenBudget</div>
        <div className="card-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            BergenBudget er en personlig okonomiapp laget for nordmenn i Bergen.
            Hold oversikt over kontoer, transaksjoner, budsjetter og skatterelevante kategorier
            som skattetrekk, feriepenger og BSU-sparing.
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>Versjon: 1.0.0</div>
            <div>Valuta: NOK (Norske kroner)</div>
            <div>Tallformat: 1 234 567,89</div>
            <div>Datoformat: DD.MM.YYYY</div>
          </div>
        </div>
      </div>
    </div>
  );
}
