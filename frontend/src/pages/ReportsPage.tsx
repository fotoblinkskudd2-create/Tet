import { useState, useEffect, lazy, Suspense } from 'react';
import { reports as reportsApi } from '../api/client';
import { nb, formatNOK, formatNOKShort } from '../i18n/nb';

const NetWorthChart = lazy(() => import('../components/NetWorthChart'));
const ForecastChart = lazy(() => import('../components/ForecastChart'));

type Tab = 'monthly' | 'annual' | 'networth' | 'forecast';

export default function ReportsPage() {
  const now = new Date();
  const [tab, setTab] = useState<Tab>('monthly');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (tab) {
        case 'monthly':
          setData(await reportsApi.monthly(year, month));
          break;
        case 'annual':
          setData(await reportsApi.annual(year));
          break;
        case 'networth':
          setData(await reportsApi.netWorth());
          break;
        case 'forecast':
          setData(await reportsApi.forecast(12));
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab, year, month]);

  const handleExport = () => {
    reportsApi.exportCsv(
      tab === 'monthly' || tab === 'annual' ? year : undefined,
      tab === 'monthly' ? month : undefined
    );
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {([
          ['monthly', nb.reports.monthlyReport],
          ['annual', nb.reports.annualReport],
          ['networth', nb.reports.netWorth],
          ['forecast', nb.reports.forecast],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`btn ${tab === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
        <button className="btn btn-secondary" onClick={handleExport}>
          {nb.reports.exportCsv}
        </button>
      </div>

      {/* Period selector */}
      {(tab === 'monthly' || tab === 'annual') && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {tab === 'monthly' && (
            <select className="form-select" style={{ width: 'auto' }} value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {nb.months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}
          <select className="form-select" style={{ width: 'auto' }} value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {loading && <div className="loading-screen"><div className="spinner" /><p>Laster rapport...</p></div>}

      {!loading && data && tab === 'monthly' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">{nb.reports.totalIncome}</div>
              <div className="stat-value income">{formatNOKShort(data.summary.totalIncome)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{nb.reports.totalExpenses}</div>
              <div className="stat-value expense">{formatNOKShort(data.summary.totalExpenses)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{nb.reports.net}</div>
              <div className={`stat-value ${data.summary.net >= 0 ? 'income' : 'expense'}`}>
                {formatNOKShort(data.summary.net)}
              </div>
            </div>
          </div>

          {/* By category */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">Fordelt pa kategori</div>
            <div className="card-body">
              {data.byCategory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Ingen transaksjoner denne perioden</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Kategori</th>
                        <th>Antall</th>
                        <th style={{ textAlign: 'right' }}>Totalt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byCategory.map((c: any) => (
                        <tr key={c.id || 'uncategorized'}>
                          <td><span className="category-chip">{c.icon || ''} {c.name || 'Ukategorisert'}</span></td>
                          <td>{c.count}</td>
                          <td style={{ textAlign: 'right' }} className={c.category_type === 'income' ? 'amount-income' : 'amount-expense'}>
                            {formatNOK(c.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Tax items */}
          {data.taxItems.length > 0 && (
            <div className="card">
              <div className="card-header">{nb.reports.taxSummary}</div>
              <div className="card-body">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Kategori</th>
                        <th>Skattekode</th>
                        <th style={{ textAlign: 'right' }}>Belop</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.taxItems.map((t: any, i: number) => (
                        <tr key={i}>
                          <td>{t.category_name}</td>
                          <td><span className="tag">{t.tax_code}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNOK(t.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && data && tab === 'annual' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Arsinntekt</div>
              <div className="stat-value income">{formatNOKShort(data.totals.income)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Arsutgifter</div>
              <div className="stat-value expense">{formatNOKShort(data.totals.expenses)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Arsnetto</div>
              <div className={`stat-value ${data.totals.net >= 0 ? 'income' : 'expense'}`}>
                {formatNOKShort(data.totals.net)}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">Manedsoversikt {year}</div>
            <div className="card-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Maned</th>
                      <th style={{ textAlign: 'right' }}>Inntekt</th>
                      <th style={{ textAlign: 'right' }}>Utgifter</th>
                      <th style={{ textAlign: 'right' }}>Netto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly.map((m: any) => (
                      <tr key={m.month}>
                        <td>{nb.months[m.month - 1]}</td>
                        <td style={{ textAlign: 'right' }} className="amount-income">{formatNOK(m.income)}</td>
                        <td style={{ textAlign: 'right' }} className="amount-expense">{formatNOK(m.expenses)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className={m.net >= 0 ? 'amount-income' : 'amount-expense'}>
                          {formatNOK(m.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {data.taxSummary.length > 0 && (
            <div className="card">
              <div className="card-header">{nb.reports.taxSummary} {year}</div>
              <div className="card-body">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Kategori</th>
                        <th>Skattekode</th>
                        <th style={{ textAlign: 'right' }}>Arsbelop</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.taxSummary.map((t: any, i: number) => (
                        <tr key={i}>
                          <td>{t.category_name}</td>
                          <td><span className="tag">{t.tax_code}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNOK(t.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && data && tab === 'networth' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Eiendeler</div>
              <div className="stat-value income">{formatNOKShort(data.current.totalAssets)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Gjeld</div>
              <div className="stat-value expense">{formatNOKShort(data.current.totalLiabilities)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Nettoverdi</div>
              <div className={`stat-value ${data.current.netWorth >= 0 ? 'income' : 'expense'}`}>
                {formatNOKShort(data.current.netWorth)}
              </div>
            </div>
          </div>

          {data.history.length > 0 && (
            <div className="card">
              <div className="card-header">Nettoverdi over tid</div>
              <div className="card-body">
                <Suspense fallback={<div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Laster graf...</div>}>
                  <NetWorthChart data={data.history} />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && data && tab === 'forecast' && (
        <div>
          <div className={`alert ${data.monthlyNetAvg >= 0 ? 'alert-success' : 'alert-warning'}`}>
            {data.message}
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Navaerende saldo</div>
              <div className="stat-value">{formatNOKShort(data.currentBalance)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Gj.snittlig manedlig netto</div>
              <div className={`stat-value ${data.monthlyNetAvg >= 0 ? 'income' : 'expense'}`}>
                {formatNOKShort(data.monthlyNetAvg)}
              </div>
            </div>
            {data.brokeDate && (
              <div className="stat-card">
                <div className="stat-label">Tom for penger</div>
                <div className="stat-value expense">{data.brokeDate}</div>
              </div>
            )}
          </div>

          {data.projectedBalances.length > 0 && (
            <div className="card">
              <div className="card-header">Saldoprognose (12 maneder)</div>
              <div className="card-body">
                <Suspense fallback={<div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Laster graf...</div>}>
                  <ForecastChart data={data.projectedBalances} />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
