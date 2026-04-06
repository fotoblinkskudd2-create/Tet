import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SocialLayout from '../../components/SocialLayout';
import PlatformBadge from '../../components/PlatformBadge';
import { Platform, PLATFORMS, DEFAULT_POSTING_TIMES, ScheduledPost } from '../../types/social';

export default function ComposePage() {
  const router = useRouter();
  const { edit: editId } = router.query;

  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState(DEFAULT_POSTING_TIMES[0]);
  const [status, setStatus] = useState<'draft' | 'scheduled'>('scheduled');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');

  // Load post for editing
  useEffect(() => {
    if (editId && typeof editId === 'string') {
      loadPost(editId);
    }
  }, [editId]);

  const loadPost = async (id: string) => {
    try {
      const response = await fetch(`/api/social/posts/${id}`);
      if (response.ok) {
        const post: ScheduledPost = await response.json();
        setContent(post.content);
        setSelectedPlatforms(post.platforms);
        setHashtags(post.hashtags.join(' '));
        const date = new Date(post.scheduledAt);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
        setStatus(post.status === 'published' ? 'scheduled' : (post.status as 'draft' | 'scheduled'));
      }
    } catch {
      setMessage('Kunne ikke laste innlegg');
    }
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const selectAllPlatforms = () => {
    if (selectedPlatforms.length === PLATFORMS.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(PLATFORMS.map((p) => p.id));
    }
  };

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return Infinity;
    return Math.min(...selectedPlatforms.map((p) => PLATFORMS.find((pl) => pl.id === p)?.maxLength || Infinity));
  };

  const characterLimit = getCharacterLimit();
  const isOverLimit = content.length > characterLimit;

  const generateContent = async () => {
    if (selectedPlatforms.length === 0) {
      setMessage('Velg minst én plattform først');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatforms[0],
          topic: topic || 'general content',
          tone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.suggestion);
        if (data.hashtags?.length) {
          setHashtags(data.hashtags.join(' '));
        }
      }
    } catch {
      setMessage('Kunne ikke generere innhold');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage('Innholdet kan ikke være tomt');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setMessage('Velg minst én plattform');
      return;
    }
    if (isOverLimit) {
      setMessage(`Innholdet er for langt. Maks ${characterLimit} tegn.`);
      return;
    }

    setSaving(true);
    setMessage(null);

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    const hashtagList = hashtags
      .split(/[\s,]+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    try {
      const url = editId ? `/api/social/posts/${editId}` : '/api/social/posts';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          scheduledAt,
          hashtags: hashtagList,
          status,
        }),
      });

      if (response.ok) {
        setMessage(editId ? 'Innlegg oppdatert!' : 'Innlegg opprettet!');
        if (!editId) {
          setTimeout(() => router.push('/social'), 1000);
        }
      } else {
        const data = await response.json();
        setMessage(data.error || 'Noe gikk galt');
      }
    } catch {
      setMessage('Kunne ikke lagre innlegget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SocialLayout title={editId ? 'Rediger innlegg' : 'Nytt innlegg'}>
      <form className="compose-form" onSubmit={handleSubmit}>
        {/* Platform selection */}
        <section className="compose-section">
          <div className="section-header">
            <h2>Velg plattformer</h2>
            <button type="button" className="btn-select-all" onClick={selectAllPlatforms}>
              {selectedPlatforms.length === PLATFORMS.length ? 'Fjern alle' : 'Velg alle'}
            </button>
          </div>
          <div className="platform-selector">
            {PLATFORMS.map((platform) => (
              <PlatformBadge
                key={platform.id}
                platform={platform.id}
                selected={selectedPlatforms.includes(platform.id)}
                onClick={() => togglePlatform(platform.id)}
              />
            ))}
          </div>
        </section>

        {/* Content generation */}
        <section className="compose-section">
          <h2>Innholdsgenerator</h2>
          <div className="generator-row">
            <input
              type="text"
              placeholder="Emne (f.eks. lanseringsfest)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-topic"
            />
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="select-tone">
              <option value="casual">Uformell</option>
              <option value="professional">Profesjonell</option>
              <option value="humorous">Humoristisk</option>
              <option value="inspirational">Inspirerende</option>
            </select>
          </div>
          <button
            type="button"
            className="btn-generate"
            onClick={generateContent}
            disabled={generating}
          >
            {generating ? 'Genererer...' : '✨ Generer innhold'}
          </button>
        </section>

        {/* Content input */}
        <section className="compose-section">
          <h2>Innhold</h2>
          <textarea
            className={`compose-textarea ${isOverLimit ? 'over-limit' : ''}`}
            placeholder="Skriv innlegget ditt her..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          <div className="char-count">
            <span className={isOverLimit ? 'over-limit' : ''}>
              {content.length}
              {characterLimit < Infinity ? ` / ${characterLimit}` : ''}
            </span>
          </div>
        </section>

        {/* Hashtags */}
        <section className="compose-section">
          <h2>Hashtags</h2>
          <input
            type="text"
            className="compose-input"
            placeholder="#marketing #innhold #sosialemedier"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
          />
        </section>

        {/* Schedule */}
        <section className="compose-section">
          <h2>Publiseringstid</h2>
          <div className="schedule-row">
            <input
              type="date"
              className="compose-input"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <select
              className="compose-input"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            >
              {DEFAULT_POSTING_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
              <option value="08:00">08:00</option>
              <option value="10:00">10:00</option>
              <option value="14:00">14:00</option>
              <option value="16:00">16:00</option>
              <option value="18:00">18:00</option>
              <option value="21:00">21:00</option>
            </select>
          </div>
        </section>

        {/* Status */}
        <section className="compose-section">
          <div className="status-toggle">
            <button
              type="button"
              className={`toggle-btn ${status === 'scheduled' ? 'active' : ''}`}
              onClick={() => setStatus('scheduled')}
            >
              📅 Planlegg
            </button>
            <button
              type="button"
              className={`toggle-btn ${status === 'draft' ? 'active' : ''}`}
              onClick={() => setStatus('draft')}
            >
              📝 Lagre som utkast
            </button>
          </div>
        </section>

        {/* Submit */}
        <button type="submit" className="btn-submit" disabled={saving}>
          {saving
            ? 'Lagrer...'
            : editId
              ? 'Oppdater innlegg'
              : status === 'scheduled'
                ? 'Planlegg innlegg'
                : 'Lagre utkast'}
        </button>

        {message && <p className="compose-message">{message}</p>}
      </form>
    </SocialLayout>
  );
}
