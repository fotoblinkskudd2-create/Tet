import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { transactions as txApi, accounts as accApi, categories as catApi } from '../api/client';
import { nb, formatNOK, formatDateNO } from '../i18n/nb';

export default function TransactionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // CSV Import
  const [showImport, setShowImport] = useState(false);
  const [importAccount, setImportAccount] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 25 };
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterAccount) params.accountId = filterAccount;
      if (filterCategory) params.categoryId = filterCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const result = await txApi.list(params);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterType, filterAccount, filterCategory, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    accApi.list().then(setAccountsList).catch(() => {});
    catApi.list().then(setCategoriesList).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker pa at du vil slette denne transaksjonen?')) return;
    try {
      await txApi.delete(id);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImportCsv = async () => {
    if (!importFile || !importAccount) return;
    setImporting(true);
    try {
      const result = await txApi.importCsv(importAccount, importFile);
      setImportResult(result);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Action bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Link to="/ny-transaksjon" className="btn btn-primary">
          {nb.transactions.addTransaction}
        </Link>
        <button className="btn btn-secondary" onClick={() => setShowImport(!showImport)}>
          {nb.transactions.importCsv}
        </button>
      </div>

      {/* CSV Import section */}
      {showImport && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-header">Importer transaksjoner fra CSV</div>
          <div className="card-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Stotter Sbanken, Sparebanken Vest og generisk norsk bankformat (semikolonseparert).
            </p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Velg konto</label>
                <select className="form-select" value={importAccount} onChange={e => setImportAccount(e.target.value)}>
                  <option value="">-- Velg konto --</option>
                  {accountsList.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CSV-fil</label>
                <input
                  type="file"
                  accept=".csv"
                  className="form-input"
                  onChange={e => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleImportCsv}
              disabled={!importFile || !importAccount || importing}
            >
              {importing ? 'Importerer...' : 'Importer'}
            </button>
            {importResult && (
              <div className="alert alert-success" style={{ marginTop: '0.75rem' }}>
                {importResult.message}
                {importResult.errors.length > 0 && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary>{importResult.errors.length} advarsler</summary>
                    <ul style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {importResult.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={nb.transactions.search}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">Alle typer</option>
              <option value="income">Inntekt</option>
              <option value="expense">Utgift</option>
              <option value="transfer">Overforing</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filterAccount} onChange={e => { setFilterAccount(e.target.value); setPage(1); }}>
              <option value="">Alle kontoer</option>
              {accountsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
              <option value="">Alle kategorier</option>
              {categoriesList.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1); }}
              placeholder="Fra dato"
            />
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1); }}
              placeholder="Til dato"
            />
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="card">
        {loading ? (
          <div className="card-body"><div className="loading-screen"><div className="spinner" /></div></div>
        ) : !data || data.data.length === 0 ? (
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">{'\u{1F4B3}'}</div>
              <p>{nb.transactions.noTransactions}</p>
              <Link to="/ny-transaksjon" className="btn btn-primary btn-sm">{nb.transactions.addTransaction}</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Dato</th>
                    <th>Beskrivelse</th>
                    <th>Kategori</th>
                    <th>Konto</th>
                    <th style={{ textAlign: 'right' }}>Belop</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateNO(t.date)}</td>
                      <td>
                        {t.description}
                        {t.receipt_path && <span title="Har kvittering"> {'\u{1F4CE}'}</span>}
                        {t.is_split ? <span className="tag" style={{ marginLeft: '0.5rem' }}>Delt</span> : null}
                      </td>
                      <td>
                        {t.category_icon && <span className="category-chip">{t.category_icon} {t.category_name}</span>}
                        {!t.category_name && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                      </td>
                      <td>{t.account_name}</td>
                      <td style={{ textAlign: 'right' }} className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                        {t.type === 'income' ? '+' : '-'}{formatNOK(t.amount)}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(t.id)} title="Slett">
                          {'\u{1F5D1}'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                {nb.transactions.showing} {((data.page - 1) * data.pageSize) + 1}-{Math.min(data.page * data.pageSize, data.total)} {nb.transactions.of} {data.total}
              </span>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{nb.common.previous}</button>
              <span>{nb.transactions.page} {data.page} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>{nb.common.next}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
