import Link from 'next/link';
import styles from '../../styles/Games.module.css';

export default function DrunkWalk() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back to Games
        </Link>
        <h1 className={styles.title}>
          🚶 Drunk Walk Challenge 🚶
        </h1>
        <p className={styles.subtitle}>
          Coming Soon!
        </p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '3rem', margin: '20px 0' }}>🚧</p>
        <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '20px' }}>
          This game is under construction!
        </p>
        <p style={{ color: '#999' }}>
          Track your path while walking in a straight line using GPS.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: '30px', padding: '15px 30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
          Back to Games
        </Link>
      </div>
    </div>
  );
}
