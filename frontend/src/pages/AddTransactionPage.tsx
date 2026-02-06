import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactions as txApi, accounts as accApi, categories as catApi } from '../api/client';
import { nb, todayISO } from '../i18n/nb';

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState<any>(null);

  // Split transaction
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState([
    { description: '', amount: '', category_id: '' },
    { description: '', amount: '', category_id: '' },
  ]);

  // Receipt
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    accApi.list().then(list => {
      setAccounts(list);
      if (list.length > 0) setAccountId(list[0].id);
    });
    catApi.list().then(setCategoriesList);
  }, []);

  // Auto-categorize on description change
  useEffect(() => {
    if (!description || description.length < 3) {
      setSuggestedCategory(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const result = await txApi.suggestCategory(description);
        if (result.suggestion) {
          setSuggestedCategory(result.suggestion);
          if (!categoryId) {
            setCategoryId(result.suggestion.id);
          }
        } else {
          setSuggestedCategory(null);
        }
      } catch {}
    }, 300);
    return () => clearTimeout(timeout);
  }, [description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSplit) {
        const validSplits = splits.filter(s => s.amount && s.description);
        if (validSplits.length < 2) {
          setError('Delt transaksjon krever minst 2 deler med beskrivelse og belop');
          setLoading(false);
          return;
        }
        await txApi.split({
          account_id: accountId,
          date,
          description,
          splits: validSplits.map(s => ({
            description: s.description,
            amount: parseFloat(s.amount),
            category_id: s.category_id || undefined,
          })),
        });
      } else {
        const newTx = await txApi.create({
          account_id: accountId,
          amount: parseFloat(amount),
          description,
          date,
          type,
          category_id: categoryId || undefined,
          notes: notes || undefined,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        });

        // Upload receipt if present
        if (receiptFile && newTx.id) {
          await txApi.uploadReceipt(newTx.id, receiptFile);
        }
      }

      setSuccess('Transaksjon opprettet!');
      setTimeout(() => navigate('/transaksjoner'), 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSplitRow = () => {
    setSplits([...splits, { description: '', amount: '', category_id: '' }]);
  };

  const updateSplit = (index: number, field: string, value: string) => {
    const updated = [...splits];
    (updated[index] as any)[field] = value;
    setSplits(updated);
  };

  const expenseCategories = categoriesList.filter(c => c.type === 'expense');
  const incomeCategories = categoriesList.filter(c => c.type === 'income');
  const filteredCategories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div style={{ maxWidth: 700 }}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Type toggle */}
        <div className="form-group">
          <label className="form-label">{nb.transactions.type}</label>
          <div className="btn-group">
            <button
              type="button"
              className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setType('expense')}
            >
              Utgift
            </button>
            <button
              type="button"
              className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setType('income')}
            >
              Inntekt
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{nb.transactions.amount} (NOK)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required={!isSplit}
              disabled={isSplit}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{nb.transactions.date}</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{nb.transactions.description}</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="F.eks. Rema 1000 Danmarksplass"
            required
            autoFocus
          />
          {suggestedCategory && (
            <div className="form-hint" style={{ color: 'var(--success)' }}>
              {nb.transactions.autoCategory}: {suggestedCategory.icon} {suggestedCategory.name}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{nb.transactions.account}</label>
            <select className="form-select" value={accountId} onChange={e => setAccountId(e.target.value)} required>
              <option value="">Velg konto</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{nb.transactions.category}</label>
            <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">Velg kategori</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{nb.transactions.tags}</label>
          <input
            type="text"
            className="form-input"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Skriv inn etiketter separert med komma"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{nb.transactions.notes}</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Valgfrie notater..."
            rows={2}
          />
        </div>

        {/* Receipt upload */}
        <div className="form-group">
          <label className="form-label">{nb.transactions.receipt}</label>
          <input
            type="file"
            className="form-input"
            accept="image/*,.pdf"
            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
          />
          <div className="form-hint">Stotter JPG, PNG, PDF (maks 10 MB). OCR-behandling simulert.</div>
        </div>

        {/* Split transaction toggle */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isSplit}
              onChange={e => setIsSplit(e.target.checked)}
            />
            <span className="form-label" style={{ margin: 0 }}>{nb.transactions.splitTransaction}</span>
          </label>
        </div>

        {/* Split rows */}
        {isSplit && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">Deler av transaksjonen</div>
            <div className="card-body">
              {splits.map((split, i) => (
                <div key={i} className="form-row" style={{ marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={split.description}
                      onChange={e => updateSplit(i, 'description', e.target.value)}
                      placeholder={`Del ${i + 1} beskrivelse`}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={split.amount}
                      onChange={e => updateSplit(i, 'amount', e.target.value)}
                      placeholder="Belop"
                      step="0.01"
                      style={{ width: '120px' }}
                    />
                    <select
                      className="form-select"
                      value={split.category_id}
                      onChange={e => updateSplit(i, 'category_id', e.target.value)}
                    >
                      <option value="">Kategori</option>
                      {expenseCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSplitRow}>
                + Legg til del
              </button>
            </div>
          </div>
        )}

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Lagrer...' : 'Lagre transaksjon'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/transaksjoner')}>
            {nb.common.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
