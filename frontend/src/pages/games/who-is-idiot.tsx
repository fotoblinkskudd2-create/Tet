import Link from 'next/link';
import styles from '../../styles/Games.module.css';

export default function WhoIsIdiot() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back to Games
        </Link>
        <h1 className={styles.title}>
          🏆 Who's The Biggest Idiot? 🏆
        </h1>
        <p className={styles.subtitle}>
          Coming Soon!
        </p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '3rem', margin: '20px 0' }}>🏗️</p>
        <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '20px' }}>
          Ultimate Challenge Coming Soon!
        </p>
        <p style={{ color: '#999', marginBottom: '15px' }}>
          Combination of all mini-games to find the biggest idiot in your group!
        </p>
        <ul style={{ textAlign: 'left', color: '#666', margin: '20px auto', maxWidth: '300px' }}>
          <li>Shake-o-Meter</li>
          <li>Balance Master</li>
          <li>GPS Navigation</li>
          <li>Spin & Point</li>
          <li>...and more!</li>
        </ul>
        <Link href="/" style={{ display: 'inline-block', marginTop: '30px', padding: '15px 30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
          Back to Games
        </Link>
      </div>
    </div>
  );
}
