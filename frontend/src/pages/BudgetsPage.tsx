import { useState, useEffect } from 'react';
import { budgets as budgetApi, categories as catApi } from '../api/client';
import { nb, formatNOK, formatNOKShort } from '../i18n/nb';

export default function BudgetsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [budgetsList, setBudgetsList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Form
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetApi.list(year, month);
      setBudgetsList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [year, month]);

  useEffect(() => {
    catApi.list().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await budgetApi.create({
        category_id: formCategoryId,
        year,
        month,
        amount: parseFloat(formAmount),
      });
      setFormCategoryId('');
      setFormAmount('');
      setShowForm(false);
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Slett dette budsjettet?')) return;
    try {
      await budgetApi.delete(id);
      fetchBudgets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const totalBudgeted = budgetsList.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsList.reduce((sum, b) => sum + (b.spent || 0), 0);

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 'auto' }} value={month} onChange={e => setMonth(parseInt(e.target.value))}>
          {nb.months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {nb.budgets.addBudget}
        </button>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Totalt budsjettert</div>
          <div className="stat-value">{formatNOKShort(totalBudgeted)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Totalt brukt</div>
          <div className="stat-value expense">{formatNOKShort(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gjenstar</div>
          <div className={`stat-value ${totalBudgeted - totalSpent >= 0 ? 'income' : 'expense'}`}>
            {formatNOKShort(totalBudgeted - totalSpent)}
          </div>
        </div>
      </div>

      {/* Add budget form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">Nytt budsjett for {nb.months[month - 1]} {year}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{nb.budgets.category}</label>
                  <select className="form-select" value={formCategoryId} onChange={e => setFormCategoryId(e.target.value)} required>
                    <option value="">Velg kategori</option>
                    {expenseCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Budsjettbelop (NOK)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    placeholder="5000"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">{nb.common.save}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{nb.common.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget list */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : budgetsList.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">{'\u{1F4CB}'}</div>
              <p>{nb.budgets.noBudgets}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {budgetsList.map((b: any) => {
              const spent = b.spent || 0;
              const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
              const remaining = b.amount - spent;
              return (
                <div key={b.id} className="budget-item">
                  <div className="budget-item-header">
                    <span className="budget-item-name">
                      {b.category_icon} {b.category_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="budget-item-amounts">
                        {formatNOK(spent)} / {formatNOK(b.amount)}
                        <span style={{ marginLeft: '0.5rem', color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          ({remaining >= 0 ? `${formatNOK(remaining)} igjen` : `${formatNOK(Math.abs(remaining))} over`})
                        </span>
                      </span>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(b.id)}>{nb.common.delete}</button>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ marginTop: '0.35rem' }}>
                    <div
                      className={`progress-fill ${pct > 100 ? 'danger' : pct > 80 ? 'warning' : 'ok'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
