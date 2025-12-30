import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Games.module.css';

export default function HomePage() {
  const games = [
    {
      id: 'shake-o-meter',
      title: 'Shake-o-Meter',
      description: 'Who can shake their phone the hardest? Find out who\'s the biggest idiot!',
      emoji: '📳',
      difficulty: 'Easy',
      players: '1-10'
    },
    {
      id: 'balance-master',
      title: 'Balance Master',
      description: 'Hold your phone perfectly still. Good luck doing that while drunk!',
      emoji: '🎯',
      difficulty: 'Hard',
      players: '1-10'
    },
    {
      id: 'treasure-hunt',
      title: 'GPS Treasure Hunt',
      description: 'Navigate to a random location nearby. Hot or cold? You decide!',
      emoji: '🗺️',
      difficulty: 'Medium',
      players: '1-5'
    },
    {
      id: 'spin-point',
      title: 'Spin & Point',
      description: 'Spin around and point to a target direction. Dizzy yet?',
      emoji: '🧭',
      difficulty: 'Medium',
      players: '1-10'
    },
    {
      id: 'drunk-walk',
      title: 'Drunk Walk Challenge',
      description: 'Walk in a straight line while drunk. GPS tracks your path!',
      emoji: '🚶',
      difficulty: 'Hard',
      players: '1-5'
    },
    {
      id: 'who-is-idiot',
      title: 'Who\'s The Biggest Idiot?',
      description: 'Combination of all challenges. May the worst drunk win!',
      emoji: '🏆',
      difficulty: 'Expert',
      players: '2-10'
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.emoji}>🍺</span>
          Drunk Party Games
          <span className={styles.emoji}>🎉</span>
        </h1>
        <p className={styles.subtitle}>
          Stupid games for drunk people using GPS & Gyroscope
        </p>
        <div className={styles.warning}>
          <p>⚠️ Drink responsibly! Don't be an actual idiot.</p>
        </div>
      </header>

      <div className={styles.gameGrid}>
        {games.map((game) => (
          <Link href={`/games/${game.id}`} key={game.id} className={styles.gameCard}>
            <div className={styles.gameEmoji}>{game.emoji}</div>
            <h2 className={styles.gameTitle}>{game.title}</h2>
            <p className={styles.gameDescription}>{game.description}</p>
            <div className={styles.gameInfo}>
              <span className={styles.badge}>🎲 {game.difficulty}</span>
              <span className={styles.badge}>👥 {game.players}</span>
            </div>
            <button className={styles.playButton}>
              Play Now!
            </button>
          </Link>
        ))}
      </div>

      <footer className={styles.footer}>
        <p>Built with chaos and sensors 🤖</p>
        <p className={styles.smallText}>
          Works best on mobile devices with GPS and gyroscope
        </p>
      </footer>
    </div>
  );
}
