import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Tet</h1>
      <p>Velkom! Logg inn eller opprett konto for å spille.</p>
      <div className="home-actions">
        <Link href="/auth/login" className="btn">Logg inn</Link>
        <Link href="/auth/signup" className="btn btn-secondary">Opprett konto</Link>
      </div>
    </div>
  );
}
