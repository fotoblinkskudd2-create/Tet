import { useState, useEffect } from 'react';
import { accounts as accApi } from '../api/client';
import { nb, formatNOK } from '../i18n/nb';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [bankName, setBankName] = useState('');
  const [balance, setBalance] = useState('0');

  const fetchAccounts = async () => {
    try {
      const data = await accApi.list();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const resetForm = () => {
    setName('');
    setType('checking');
    setBankName('');
    setBalance('0');
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editId) {
        await accApi.update(editId, { name, type, bank_name: bankName, balance: parseFloat(balance) });
      } else {
        await accApi.create({ name, type, bank_name: bankName, balance: parseFloat(balance) });
      }
      fetchAccounts();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (account: any) => {
    setName(account.name);
    setType(account.type);
    setBankName(account.bank_name || '');
    setBalance(String(account.balance));
    setEditId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker pa at du vil slette denne kontoen?')) return;
    try {
      await accApi.delete(id);
      fetchAccounts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const typeLabels: Record<string, string> = {
    checking: 'Brukskonto',
    savings: 'Sparekonto',
    credit: 'Kredittkort',
    bsu: 'BSU',
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total saldo:</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: '0.5rem' }}>{formatNOK(totalBalance)}</span>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          {nb.accounts.addAccount}
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            {editId ? 'Rediger konto' : 'Ny konto'}
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>{nb.common.close}</button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{nb.accounts.accountName}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="F.eks. Brukskonto DNB"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{nb.accounts.accountType}</label>
                  <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                    <option value="checking">{typeLabels.checking}</option>
                    <option value="savings">{typeLabels.savings}</option>
                    <option value="credit">{typeLabels.credit}</option>
                    <option value="bsu">{typeLabels.bsu}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{nb.accounts.bankName}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="F.eks. DNB, Sbanken, Sparebanken Vest"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Startsaldo (NOK)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={balance}
                    onChange={e => setBalance(e.target.value)}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">
                  {editId ? nb.common.save : 'Opprett konto'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  {nb.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">{'\u{1F3E6}'}</div>
              <p>Ingen kontoer enna. Opprett din forste konto for a komme i gang.</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                {nb.accounts.addAccount}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {accounts.map(account => (
            <div key={account.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{account.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {typeLabels[account.type]} {account.bank_name ? `\u{2022} ${account.bank_name}` : ''}
                    </div>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(account)}>
                      {nb.common.edit}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(account.id)}>
                      {nb.common.delete}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                    <span className={account.balance >= 0 ? 'amount-income' : 'amount-expense'}>
                      {formatNOK(account.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
