import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="hero-title">📚 One-Click Romanforfatter</h1>
        <p className="hero-subtitle">
          Generer komplette noveller med AI - fra idé til ferdig bok på minutter
        </p>

        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">✍️</span>
            <h3>AI-Drevet</h3>
            <p>Bruker Claude Opus 4.5 for autentisk og engasjerende historiefortelling</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📖</span>
            <h3>Flipbar Bok</h3>
            <p>Vakker bokvisning med mørk pergament og dekadente effekter</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💾</span>
            <h3>Eksporter</h3>
            <p>Last ned som Markdown eller PDF for videre redigering</p>
          </div>
        </div>

        <div className="hero-cta">
          <Link href="/novels/generate" className="btn-hero-primary">
            🚀 Start å skrive
          </Link>
          <Link href="/novels" className="btn-hero-secondary">
            📚 Mine romaner
          </Link>
        </div>

        <div className="auth-links">
          <p>
            <Link href="/auth/login">Logg inn</Link> eller{' '}
            <Link href="/auth/signup">Opprett konto</Link>
          </p>
        </div>
      </div>

      <div className="examples-section">
        <h2>Eksempler på sjangere</h2>
        <div className="genre-grid">
          <div className="genre-card">
            <h3>🧛 Gotisk Horror</h3>
            <p>Mørke slott, vampyrer, og dekadente mysterier</p>
          </div>
          <div className="genre-card">
            <h3>🗡️ Historisk Drama</h3>
            <p>Vikinger, middelalder, og norsk historie</p>
          </div>
          <div className="genre-card">
            <h3>🌲 Norsk Folklore</h3>
            <p>Troll, nisser, og eventyrlige skapninger</p>
          </div>
          <div className="genre-card">
            <h3>🔪 Thriller</h3>
            <p>Spenning, mysterier, og uforutsigbare vendinger</p>
          </div>
          <div className="genre-card">
            <h3>💕 Romantikk</h3>
            <p>Kjærlighet, drama, og følelsesmessige reiser</p>
          </div>
          <div className="genre-card">
            <h3>🔮 Fantasy</h3>
            <p>Magi, eventyr, og fantastiske verdener</p>
          </div>
        </div>
      </div>
    </div>
  );
}
