import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { dashboard as dashboardApi } from '../api/client';
import { nb, formatNOK, formatNOKShort, formatDateNO } from '../i18n/nb';

const MonthlyChart = lazy(() => import('../components/MonthlyChart'));

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Laster oversikt...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const net = data.monthlyIncome - data.monthlyExpenses;

  return (
    <div>
      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{nb.dashboard.totalBalance}</div>
          <div className="stat-value">{formatNOKShort(data.totalBalance)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {data.accounts.length} {data.accounts.length === 1 ? 'konto' : 'kontoer'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{nb.dashboard.monthlyIncome}</div>
          <div className="stat-value income">+{formatNOKShort(data.monthlyIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{nb.dashboard.monthlyExpenses}</div>
          <div className="stat-value expense">-{formatNOKShort(data.monthlyExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Netto denne maneden</div>
          <div className={`stat-value ${net >= 0 ? 'income' : 'expense'}`}>
            {net >= 0 ? '+' : ''}{formatNOKShort(net)}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Monthly chart */}
        <div className="card">
          <div className="card-header">{nb.dashboard.incomeVsExpenses}</div>
          <div className="card-body">
            <Suspense fallback={<div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Laster graf...</div>}>
              <MonthlyChart data={data.monthlyChart} />
            </Suspense>
          </div>
        </div>

        {/* Budget progress */}
        <div className="card">
          <div className="card-header">
            {nb.dashboard.budgetProgress}
            <Link to="/budsjetter" className="btn btn-ghost btn-sm">Se alle</Link>
          </div>
          <div className="card-body">
            {data.budgetProgress.length === 0 ? (
              <div className="empty-state">
                <p>Ingen budsjetter satt enna</p>
                <Link to="/budsjetter" className="btn btn-primary btn-sm">Opprett budsjett</Link>
              </div>
            ) : (
              data.budgetProgress.map((b: any) => (
                <div key={b.id} className="budget-item">
                  <div className="budget-item-header">
                    <span className="budget-item-name">
                      {b.category_icon} {b.category_name}
                    </span>
                    <span className="budget-item-amounts">
                      {formatNOKShort(b.spent)} / {formatNOKShort(b.budgeted)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${b.percentage > 90 ? 'danger' : b.percentage > 70 ? 'warning' : 'ok'}`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Upcoming recurring */}
        <div className="card">
          <div className="card-header">
            {nb.dashboard.upcomingRecurring}
            <Link to="/transaksjoner" className="btn btn-ghost btn-sm">Se alle</Link>
          </div>
          <div className="card-body">
            {data.upcomingRecurring.length === 0 ? (
              <div className="empty-state">
                <p>Ingen kommende faste transaksjoner neste 7 dager</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Dato</th>
                      <th>Beskrivelse</th>
                      <th style={{ textAlign: 'right' }}>Belop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingRecurring.map((r: any) => (
                      <tr key={r.id}>
                        <td>{formatDateNO(r.next_date)}</td>
                        <td>
                          <span className="category-chip">
                            {r.category_icon} {r.description}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} className={r.type === 'income' ? 'amount-income' : 'amount-expense'}>
                          {r.type === 'income' ? '+' : '-'}{formatNOK(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="card-header">
            {nb.dashboard.recentTransactions}
            <Link to="/transaksjoner" className="btn btn-ghost btn-sm">Se alle</Link>
          </div>
          <div className="card-body">
            {data.recentTransactions.length === 0 ? (
              <div className="empty-state">
                <p>Ingen transaksjoner enna</p>
                <Link to="/ny-transaksjon" className="btn btn-primary btn-sm">Legg til transaksjon</Link>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Dato</th>
                      <th>Beskrivelse</th>
                      <th style={{ textAlign: 'right' }}>Belop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.map((t: any) => (
                      <tr key={t.id}>
                        <td>{formatDateNO(t.date)}</td>
                        <td>
                          <span className="category-chip">
                            {t.category_icon || ''} {t.description}
                          </span>
                          <br />
                          <small style={{ color: 'var(--text-muted)' }}>{t.account_name}</small>
                        </td>
                        <td style={{ textAlign: 'right' }} className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                          {t.type === 'income' ? '+' : '-'}{formatNOK(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accounts overview */}
      {data.accounts.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            Kontoer
            <Link to="/kontoer" className="btn btn-ghost btn-sm">Administrer</Link>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Konto</th>
                    <th>Bank</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.accounts.map((a: any) => {
                    const typeLabels: Record<string, string> = {
                      checking: 'Brukskonto',
                      savings: 'Sparekonto',
                      credit: 'Kredittkort',
                      bsu: 'BSU',
                    };
                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>{a.name}</td>
                        <td>{a.bank_name || '-'}</td>
                        <td>{typeLabels[a.type] || a.type}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className={a.balance >= 0 ? 'amount-income' : 'amount-expense'}>
                          {formatNOK(a.balance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
