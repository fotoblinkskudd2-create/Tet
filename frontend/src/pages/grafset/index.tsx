import { useState } from 'react';
import Link from 'next/link';

interface GrafsetIdea {
  id: string;
  title: string;
  description: string;
  category: 'design' | 'marketing' | 'content' | 'social' | 'branding';
  estimatedCost: string;
  agentSuggestion: string;
  medium: string;
}

const SMART_IDEAS: GrafsetIdea[] = [
  {
    id: 'gi-001',
    title: 'Quick-turnaround social banners',
    description:
      'Generate eye-catching social media banners with AI-assisted prompts. Paste the output into any iOS-friendly image tool.',
    category: 'design',
    estimatedCost: 'Free – $5',
    agentSuggestion:
      'Use the art prompt builder with bold triadic colors and minimal text overlay.',
    medium: 'art',
  },
  {
    id: 'gi-002',
    title: 'Micro-video product teasers',
    description:
      'Create 15-second vertical video teasers optimized for Reels and TikTok. Agent generates shot lists and pacing cues.',
    category: 'marketing',
    estimatedCost: 'Free – $10',
    agentSuggestion:
      'Start with a dolly-in reveal, add subtitle hooks at 3s and 8s, close with a CTA card.',
    medium: 'video',
  },
  {
    id: 'gi-003',
    title: 'AI-powered blog outlines',
    description:
      'Let the agent brainstorm blog post structures, headlines, and SEO-friendly summaries from a single topic sentence.',
    category: 'content',
    estimatedCost: 'Free',
    agentSuggestion:
      'Provide one sentence about your product, and the agent returns a 5-section outline with hook ideas.',
    medium: 'art',
  },
  {
    id: 'gi-004',
    title: 'Brand voice poem cards',
    description:
      'Short poetic cards that capture brand personality. Share them as stories or print as micro-posters.',
    category: 'branding',
    estimatedCost: 'Free – $2',
    agentSuggestion:
      'Use the poem prompt builder with haiku form and one signature sensory image per line.',
    medium: 'poem',
  },
  {
    id: 'gi-005',
    title: 'Soundtrack loops for ads',
    description:
      'Generate mood-matched music prompts for ad backing tracks. Export-ready loops at 60–90 seconds.',
    category: 'marketing',
    estimatedCost: 'Free – $15',
    agentSuggestion:
      'Specify BPM, genre feel, and a single lead instrument. The agent adds structure and looping cues.',
    medium: 'music',
  },
  {
    id: 'gi-006',
    title: 'Community engagement templates',
    description:
      'Ready-made post templates for community building on social platforms. Poll starters, AMA prompts, and challenge posts.',
    category: 'social',
    estimatedCost: 'Free',
    agentSuggestion:
      'The agent tailors each template to your niche and adds engagement hooks.',
    medium: 'art',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  design: 'Design',
  marketing: 'Marketing',
  content: 'Content',
  social: 'Social',
  branding: 'Branding',
};

export default function GrafsetPage() {
  const [filter, setFilter] = useState<string>('all');
  const [agentInput, setAgentInput] = useState('');
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];

  const filtered =
    filter === 'all'
      ? SMART_IDEAS
      : SMART_IDEAS.filter((idea) => idea.category === filter);

  const handleAgentQuery = async () => {
    if (!agentInput.trim()) return;
    setAgentLoading(true);
    setAgentResult(null);

    try {
      const response = await fetch('/api/grafset/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: agentInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Agent request failed');
      setAgentResult(data.prompt);
    } catch (err) {
      setAgentResult(`Error: ${(err as Error).message}`);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="grafset-page">
      <header className="grafset-header">
        <h1>Grafset Smart Ideas</h1>
        <p className="subtitle">
          Budget-friendly creative ideas powered by AI agents — optimized for
          iOS web
        </p>
        <nav className="grafset-nav">
          <Link href="/">Hjem</Link>
          <Link href="/openclaw">OpenClaw Promo</Link>
          <Link href="/auth/login">Logg inn</Link>
        </nav>
      </header>

      <section className="agent-assistant">
        <h2>Smart Agent Assistant</h2>
        <p>
          Describe your idea in a few words and the agent will shape it into a
          production-ready creative brief.
        </p>
        <div className="agent-input-row">
          <input
            type="text"
            placeholder="e.g. cozy café product photo at golden hour"
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgentQuery()}
          />
          <button onClick={handleAgentQuery} disabled={agentLoading}>
            {agentLoading ? 'Thinking...' : 'Ask Agent'}
          </button>
        </div>
        {agentResult && (
          <div className="agent-result">
            <strong>Agent says:</strong>
            <p>{agentResult}</p>
          </div>
        )}
      </section>

      <section className="ideas-section">
        <h2>Smart &amp; Cheap Ideas</h2>
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={filter === cat ? 'active' : ''}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'Alle' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="ideas-grid">
          {filtered.map((idea) => (
            <article key={idea.id} className="idea-card">
              <span className="idea-badge">
                {CATEGORY_LABELS[idea.category]}
              </span>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <div className="idea-meta">
                <span className="cost">{idea.estimatedCost}</span>
                <span className="medium">{idea.medium}</span>
              </div>
              <div className="agent-tip">
                <strong>Agent tip:</strong> {idea.agentSuggestion}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Promote on OpenClaw</h2>
        <p>
          Ready to share your creation? Push your best ideas to OpenClaw and
          reach a wider audience.
        </p>
        <Link href="/openclaw" className="cta-button">
          Go to OpenClaw Promo
        </Link>
      </section>
    </div>
  );
}
