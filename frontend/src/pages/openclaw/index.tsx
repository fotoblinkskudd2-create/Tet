import { useState } from 'react';
import Link from 'next/link';

interface PromoEntry {
  title: string;
  description: string;
  medium: string;
  tags: string[];
}

export default function OpenClawPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('art');
  const [tags, setTags] = useState('');
  const [submissions, setSubmissions] = useState<PromoEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const entry: PromoEntry = {
      title: title.trim(),
      description: description.trim(),
      medium,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch('/api/openclaw/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      setSubmissions((prev) => [data.entry, ...prev]);
      setMessage('Promoted successfully on OpenClaw!');
      setTitle('');
      setDescription('');
      setTags('');
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="openclaw-page">
      <header className="openclaw-header">
        <h1>OpenClaw Promo</h1>
        <p className="subtitle">
          Promote your Grafset smart ideas to the OpenClaw community
        </p>
        <nav className="openclaw-nav">
          <Link href="/">Hjem</Link>
          <Link href="/grafset">Grafset Ideas</Link>
          <Link href="/auth/login">Logg inn</Link>
        </nav>
      </header>

      <section className="promo-form-section">
        <h2>Submit a Promotion</h2>
        <form onSubmit={handleSubmit} className="promo-form">
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My creative idea"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea and why people should check it out..."
              rows={4}
              required
            />
          </label>

          <label>
            Medium
            <select value={medium} onChange={(e) => setMedium(e.target.value)}>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="music">Music</option>
              <option value="art">Art</option>
              <option value="poem">Poem</option>
            </select>
          </label>

          <label>
            Tags (comma-separated)
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="budget, branding, social"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Promote on OpenClaw'}
          </button>
        </form>

        {message && <p className="status">{message}</p>}
      </section>

      <section className="promo-feed">
        <h2>Recent Promotions</h2>
        {submissions.length === 0 && (
          <p className="empty-state">
            No promotions yet. Be the first to share!
          </p>
        )}
        {submissions.map((entry, idx) => (
          <article key={idx} className="promo-card">
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <div className="promo-meta">
              <span className="promo-medium">{entry.medium}</span>
              {entry.tags.map((tag) => (
                <span key={tag} className="promo-tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
