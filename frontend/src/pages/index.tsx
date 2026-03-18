import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Grafset + OpenClaw</h1>
        <p className="subtitle">
          Smart, cheap creative ideas powered by AI agents — built for iOS web
        </p>
      </header>

      <nav className="home-nav">
        <Link href="/grafset" className="nav-card">
          <h2>Grafset Smart Ideas</h2>
          <p>
            Browse budget-friendly creative ideas with AI agent suggestions for
            design, marketing, content, social, and branding.
          </p>
        </Link>

        <Link href="/openclaw" className="nav-card">
          <h2>OpenClaw Promo</h2>
          <p>
            Promote your best ideas to the OpenClaw community. Share creative
            briefs, get feedback, and grow your reach.
          </p>
        </Link>

        <Link href="/auth/login" className="nav-card">
          <h2>Logg inn</h2>
          <p>Sign in to save your ideas and track your promotions.</p>
        </Link>
      </nav>

      <section className="home-features">
        <h2>Why Grafset + OpenClaw?</h2>
        <ul>
          <li>
            <strong>Smart agent assistance</strong> — Describe your idea in a
            few words and get a production-ready creative brief
          </li>
          <li>
            <strong>Budget-friendly</strong> — Every idea is tagged with
            estimated cost so you can pick what fits
          </li>
          <li>
            <strong>iOS web optimized</strong> — All prompts and outputs are
            compact and paste-ready for mobile Safari
          </li>
          <li>
            <strong>Multi-medium</strong> — Photo, video, music, art, and poetry
            prompts in one place
          </li>
          <li>
            <strong>OpenClaw promotion</strong> — Share your creations with a
            community that cares about creative quality
          </li>
        </ul>
      </section>
    </div>
  );
}
