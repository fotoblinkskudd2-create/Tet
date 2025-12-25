import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '100px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '3em',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Welcome to Tet
      </h1>
      <p style={{ fontSize: '1.2em', color: '#a0a0a0', marginBottom: '40px' }}>
        Your ultimate vibe playlist curator
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/curator" style={{
          padding: '15px 30px',
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          color: 'white',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '1.1em'
        }}>
          🎵 Create a Vibe
        </Link>

        <Link href="/auth/login" style={{
          padding: '15px 30px',
          background: '#1a1a1a',
          color: 'white',
          border: '1px solid #333',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '1.1em'
        }}>
          Login
        </Link>

        <Link href="/auth/signup" style={{
          padding: '15px 30px',
          background: '#1a1a1a',
          color: 'white',
          border: '1px solid #333',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '1.1em'
        }}>
          Sign Up
        </Link>
      </div>
    </div>
  );
}
