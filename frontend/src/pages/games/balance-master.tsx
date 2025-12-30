import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { startGyroscope } from '../../utils/sensors';
import styles from '../../styles/BalanceGame.module.css';

interface Player {
  name: string;
  score: number;
  time: number;
}

export default function BalanceMaster() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentTilt, setCurrentTilt] = useState({ x: 0, y: 0 });
  const [stability, setStability] = useState(100);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isInZone, setIsInZone] = useState(false);

  const stopSensorRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameOverRef = useRef(false);

  const TILT_THRESHOLD = 15; // degrees

  const requestPermission = async () => {
    try {
      const cleanup = await startGyroscope((data) => {
        // Just testing permission
      });
      cleanup();
      setPermissionGranted(true);
      return true;
    } catch (error) {
      alert('Please allow gyroscope access to play this game!');
      return false;
    }
  };

  const startGame = async () => {
    if (!playerName.trim()) {
      alert('Enter your name first!');
      return;
    }

    const hasPermission = permissionGranted || await requestPermission();
    if (!hasPermission) return;

    setIsPlaying(true);
    setShowResults(false);
    setTimeElapsed(0);
    setStability(100);
    gameOverRef.current = false;

    try {
      const cleanup = await startGyroscope((data) => {
        if (gameOverRef.current) return;

        const beta = data.beta ?? 0;
        const gamma = data.gamma ?? 0;

        setCurrentTilt({ x: gamma, y: beta });

        // Calculate how far from level
        const tiltAmount = Math.sqrt(gamma * gamma + beta * beta);
        const inZone = tiltAmount < TILT_THRESHOLD;
        setIsInZone(inZone);

        // Decrease stability if tilted too much
        if (!inZone) {
          setStability((prev) => {
            const newStability = Math.max(0, prev - 0.5);
            if (newStability === 0) {
              endGame();
            }
            return newStability;
          });
        }
      });

      stopSensorRef.current = cleanup;

      // Start timer
      timerRef.current = setInterval(() => {
        if (!gameOverRef.current) {
          setTimeElapsed((prev) => prev + 0.1);
        }
      }, 100);
    } catch (error) {
      alert('Failed to start gyroscope. Make sure you\'re on a mobile device!');
      setIsPlaying(false);
    }
  };

  const endGame = () => {
    gameOverRef.current = true;
    setIsPlaying(false);

    if (stopSensorRef.current) {
      stopSensorRef.current();
      stopSensorRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalScore = Math.round(timeElapsed * 10) / 10;

    const newPlayer: Player = {
      name: playerName,
      score: finalScore,
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

  const getStabilityColor = () => {
    if (stability > 70) return '#4CAF50';
    if (stability > 40) return '#FFC107';
    return '#F44336';
  };

  const getEncouragement = () => {
    if (stability > 90) return 'PERFECTLY STEADY! 🎯';
    if (stability > 70) return 'Nice and stable! 👍';
    if (stability > 50) return 'Keep it steady... 😰';
    if (stability > 20) return 'WOBBLING HARD! 😵';
    return 'ABOUT TO FAIL!! 💀';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back to Games
        </Link>
        <h1 className={styles.title}>
          🎯 Balance Master 🎯
        </h1>
        <p className={styles.subtitle}>
          Hold your phone perfectly still. Good luck doing that drunk!
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
              placeholder="Enter your name..."
              maxLength={20}
            />
          </div>

          <button onClick={startGame} className={styles.startButton}>
            Start Balancing! 🎯
          </button>

          <div className={styles.instructions}>
            <h3>How to Play:</h3>
            <ol>
              <li>Hold your phone as level as possible</li>
              <li>Stay within the safe zone (green circle)</li>
              <li>Your stability decreases if you tilt too much</li>
              <li>Game ends when stability reaches 0</li>
              <li>Try to last as long as possible!</li>
            </ol>
            <p className={styles.tip}>💡 Tip: This is REALLY hard when drunk!</p>
          </div>
        </div>
      )}

      {isPlaying && (
        <div className={styles.gameScreen}>
          <div className={styles.timeDisplay}>
            <h2>{timeElapsed.toFixed(1)}s</h2>
          </div>

          <div className={styles.balanceIndicator}>
            <div className={styles.targetZone}>
              <div
                className={styles.phoneDot}
                style={{
                  transform: `translate(${currentTilt.x * 3}px, ${currentTilt.y * 3}px)`,
                  background: isInZone ? '#4CAF50' : '#F44336'
                }}
              />
            </div>
            <div className={styles.crosshair}>
              <div className={styles.horizontalLine} />
              <div className={styles.verticalLine} />
            </div>
          </div>

          <div className={styles.tiltInfo}>
            <div className={styles.tiltValue}>
              <span>X: {Math.round(currentTilt.x)}°</span>
              <span>Y: {Math.round(currentTilt.y)}°</span>
            </div>
          </div>

          <div className={styles.stabilityBar}>
            <div className={styles.stabilityLabel}>Stability</div>
            <div className={styles.barContainer}>
              <div
                className={styles.barFill}
                style={{
                  width: `${stability}%`,
                  background: getStabilityColor()
                }}
              />
            </div>
            <div className={styles.stabilityPercent}>{Math.round(stability)}%</div>
          </div>

          <div
            className={styles.encouragement}
            style={{ color: getStabilityColor() }}
          >
            <p>{getEncouragement()}</p>
          </div>

          <button onClick={endGame} className={styles.quitButton}>
            Give Up
          </button>
        </div>
      )}

      {showResults && (
        <div className={styles.resultsScreen}>
          <div className={styles.resultCard}>
            <h2>⏱️ Time's Up! ⏱️</h2>
            <div className={styles.finalScore}>
              <p className={styles.playerNameResult}>{playerName}</p>
              <p className={styles.scoreValue}>{timeElapsed.toFixed(1)}s</p>
              <p className={styles.scoreLabel}>Survived</p>
            </div>

            {leaderboard[0]?.name === playerName && leaderboard[0]?.score === Math.round(timeElapsed * 10) / 10 && (
              <div className={styles.champion}>
                <h3>🏆 STEADIEST HANDS! 🏆</h3>
                <p>(You're not THAT drunk!)</p>
              </div>
            )}

            <button
              onClick={() => {
                setShowResults(false);
                setPlayerName('');
              }}
              className={styles.playAgainButton}
            >
              Try Again!
            </button>
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className={styles.leaderboard}>
          <h3>🏆 Balance Champions 🏆</h3>
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
                <span className={styles.score}>{player.score}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
