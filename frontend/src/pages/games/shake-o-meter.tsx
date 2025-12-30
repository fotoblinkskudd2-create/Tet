import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { startAccelerometer } from '../../utils/sensors';
import styles from '../../styles/ShakeGame.module.css';

interface Player {
  name: string;
  score: number;
  time: number;
}

export default function ShakeOMeter() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShakeIntensity, setCurrentShakeIntensity] = useState(0);
  const [maxShake, setMaxShake] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const stopSensorRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baselineRef = useRef<number>(9.8); // Gravity baseline

  const requestPermission = async () => {
    try {
      const cleanup = await startAccelerometer((data) => {
        // Just testing permission
      });
      cleanup();
      setPermissionGranted(true);
      return true;
    } catch (error) {
      alert('Please allow accelerometer access to play this game!');
      return false;
    }
  };

  const startGame = async () => {
    if (!playerName.trim()) {
      alert('Enter your name first, you drunk!');
      return;
    }

    const hasPermission = permissionGranted || await requestPermission();
    if (!hasPermission) return;

    setIsPlaying(true);
    setShowResults(false);
    setMaxShake(0);
    setCurrentShakeIntensity(0);
    setTimeLeft(10);

    // Start accelerometer
    try {
      const cleanup = await startAccelerometer((data) => {
        // Remove gravity baseline and calculate shake intensity
        const shake = Math.abs(data.magnitude - baselineRef.current);
        setCurrentShakeIntensity(shake);

        setMaxShake((prev) => Math.max(prev, shake));
      });

      stopSensorRef.current = cleanup;

      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert('Failed to start accelerometer. Make sure you\'re on a mobile device!');
      setIsPlaying(false);
    }
  };

  const endGame = () => {
    setIsPlaying(false);

    if (stopSensorRef.current) {
      stopSensorRef.current();
      stopSensorRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Add to leaderboard
    const newPlayer: Player = {
      name: playerName,
      score: Math.round(maxShake * 100) / 100,
      time: Date.now()
    };

    setLeaderboard((prev) => {
      const updated = [...prev, newPlayer].sort((a, b) => b.score - a.score).slice(0, 10);
      return updated;
    });

    setShowResults(true);
  };

  useEffect(() => {
    return () => {
      if (stopSensorRef.current) {
        stopSensorRef.current();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getShakeLevel = () => {
    if (currentShakeIntensity < 2) return 'Weak Sauce 😴';
    if (currentShakeIntensity < 5) return 'Getting There 🤔';
    if (currentShakeIntensity < 10) return 'Now We\'re Talking! 💪';
    if (currentShakeIntensity < 20) return 'BEAST MODE! 🔥';
    return 'ABSOLUTE MADNESS!! 🤯';
  };

  const getIntensityColor = () => {
    if (currentShakeIntensity < 2) return '#4CAF50';
    if (currentShakeIntensity < 5) return '#8BC34A';
    if (currentShakeIntensity < 10) return '#FFC107';
    if (currentShakeIntensity < 20) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back to Games
        </Link>
        <h1 className={styles.title}>
          📳 Shake-o-Meter 📳
        </h1>
        <p className={styles.subtitle}>
          Who can shake their phone the hardest?
        </p>
      </div>

      {!isPlaying && !showResults && (
        <div className={styles.setupScreen}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={styles.input}
              placeholder="Enter your drunk name..."
              maxLength={20}
            />
          </div>

          <button
            onClick={startGame}
            className={styles.startButton}
          >
            Start Shaking! 🎉
          </button>

          <div className={styles.instructions}>
            <h3>How to Play:</h3>
            <ol>
              <li>Enter your name (or your drunk alter-ego)</li>
              <li>Press "Start Shaking!"</li>
              <li>Shake your phone as hard as you can for 10 seconds</li>
              <li>Try not to drop your phone, you idiot!</li>
              <li>Beat your friends' scores</li>
            </ol>
          </div>
        </div>
      )}

      {isPlaying && (
        <div className={styles.gameScreen}>
          <div className={styles.timer}>
            <div className={styles.timerCircle}>
              <span className={styles.timerText}>{timeLeft}</span>
            </div>
          </div>

          <div
            className={styles.shakeMeter}
            style={{
              background: `linear-gradient(to top, ${getIntensityColor()} ${Math.min(currentShakeIntensity * 5, 100)}%, #e0e0e0 ${Math.min(currentShakeIntensity * 5, 100)}%)`
            }}
          >
            <div className={styles.meterValue}>
              {Math.round(currentShakeIntensity * 10) / 10}
            </div>
          </div>

          <div className={styles.shakeStatus}>
            <h2 style={{ color: getIntensityColor() }}>{getShakeLevel()}</h2>
          </div>

          <div className={styles.maxScore}>
            <p>Max Shake: <strong>{Math.round(maxShake * 10) / 10}</strong></p>
          </div>

          <div className={styles.encouragement}>
            <p>SHAKE IT LIKE YOU MEAN IT!</p>
          </div>
        </div>
      )}

      {showResults && (
        <div className={styles.resultsScreen}>
          <div className={styles.resultCard}>
            <h2>🎊 Results! 🎊</h2>
            <div className={styles.finalScore}>
              <p className={styles.playerNameResult}>{playerName}</p>
              <p className={styles.scoreValue}>{Math.round(maxShake * 10) / 10}</p>
              <p className={styles.scoreLabel}>Shake Score</p>
            </div>

            {leaderboard[0]?.name === playerName && leaderboard[0]?.score === maxShake && (
              <div className={styles.champion}>
                <h3>🏆 YOU'RE THE BIGGEST IDIOT! 🏆</h3>
                <p>(Congratulations!)</p>
              </div>
            )}

            <button onClick={() => {
              setShowResults(false);
              setPlayerName('');
            }} className={styles.playAgainButton}>
              Play Again!
            </button>
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className={styles.leaderboard}>
          <h3>🏆 Leaderboard of Idiots 🏆</h3>
          <div className={styles.leaderboardList}>
            {leaderboard.map((player, index) => (
              <div
                key={`${player.name}-${player.time}`}
                className={`${styles.leaderboardItem} ${index === 0 ? styles.first : ''}`}
              >
                <span className={styles.rank}>
                  {index === 0 ? '👑' : `#${index + 1}`}
                </span>
                <span className={styles.playerName}>{player.name}</span>
                <span className={styles.score}>{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
