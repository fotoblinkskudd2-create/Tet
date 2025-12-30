import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { startGyroscope } from '../../utils/sensors';
import styles from '../../styles/SpinGame.module.css';

interface Player {
  name: string;
  score: number;
  time: number;
}

export default function SpinAndPoint() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetDirection, setTargetDirection] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<number>(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const stopSensorRef = useRef<(() => void) | null>(null);
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spinCountRef = useRef(0);
  const lastAlphaRef = useRef(0);

  const MAX_ROUNDS = 5;
  const SPIN_THRESHOLD = 5; // Number of full rotations needed

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
    setRound(1);
    setScore(0);
    setHasSpun(false);
    spinCountRef.current = 0;

    startNewRound();
  };

  const startNewRound = async () => {
    // Generate random target direction
    const target = Math.floor(Math.random() * 360);
    setTargetDirection(target);
    setHasSpun(false);
    setTimeLeft(10);
    spinCountRef.current = 0;

    try {
      const cleanup = await startGyroscope((data) => {
        if (data.alpha !== null) {
          const currentAlpha = data.alpha;
          setCurrentHeading(currentAlpha);

          // Detect spinning
          const delta = currentAlpha - lastAlphaRef.current;

          // Detect if we've crossed the 0/360 boundary
          if (Math.abs(delta) > 180) {
            if (delta > 0) {
              spinCountRef.current -= 1; // Counter-clockwise crossing
            } else {
              spinCountRef.current += 1; // Clockwise crossing
            }
          }

          // Check if spun enough
          if (Math.abs(spinCountRef.current) >= SPIN_THRESHOLD && !hasSpun) {
            setHasSpun(true);
          }

          lastAlphaRef.current = currentAlpha;
        }
      });

      stopSensorRef.current = cleanup;

      // Round timer
      roundTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishRound(0); // Time's up, no points
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      alert('Failed to start gyroscope!');
      setIsPlaying(false);
    }
  };

  const submitDirection = () => {
    if (!hasSpun) {
      alert('You need to spin around first!');
      return;
    }

    // Calculate accuracy
    let difference = Math.abs(targetDirection - currentHeading);
    if (difference > 180) {
      difference = 360 - difference;
    }

    // Score based on accuracy (max 100 points per round)
    let points = 0;
    if (difference < 5) points = 100;
    else if (difference < 15) points = 80;
    else if (difference < 30) points = 60;
    else if (difference < 45) points = 40;
    else if (difference < 90) points = 20;
    else points = 10;

    finishRound(points);
  };

  const finishRound = (points: number) => {
    setScore((prev) => prev + points);

    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }

    if (stopSensorRef.current) {
      stopSensorRef.current();
      stopSensorRef.current = null;
    }

    if (round >= MAX_ROUNDS) {
      endGame();
    } else {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        startNewRound();
      }, 2000);
    }
  };

  const endGame = () => {
    setIsPlaying(false);

    const finalScore = score;
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
      if (stopSensorRef.current) stopSensorRef.current();
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, []);

  const getDirectionName = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const calculateDifference = () => {
    let diff = Math.abs(targetDirection - currentHeading);
    if (diff > 180) diff = 360 - diff;
    return Math.round(diff);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back to Games
        </Link>
        <h1 className={styles.title}>
          🧭 Spin & Point 🧭
        </h1>
        <p className={styles.subtitle}>
          Spin around and point to the target direction!
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
            Start Spinning! 🌀
          </button>

          <div className={styles.instructions}>
            <h3>How to Play:</h3>
            <ol>
              <li>Spin around {SPIN_THRESHOLD} times (the screen will tell you)</li>
              <li>After spinning, point your phone to the target direction</li>
              <li>The closer you are, the more points you get!</li>
              <li>Complete {MAX_ROUNDS} rounds</li>
              <li>Try not to fall over!</li>
            </ol>
            <p className={styles.tip}>💡 This gets REALLY hard when drunk and dizzy!</p>
          </div>
        </div>
      )}

      {isPlaying && (
        <div className={styles.gameScreen}>
          <div className={styles.roundInfo}>
            <h3>Round {round}/{MAX_ROUNDS}</h3>
            <p>Score: {score}</p>
            <p className={styles.timer}>Time: {timeLeft}s</p>
          </div>

          {!hasSpun && (
            <div className={styles.spinPrompt}>
              <h2>🌀 SPIN AROUND! 🌀</h2>
              <p>Rotations: {Math.abs(spinCountRef.current)}/{SPIN_THRESHOLD}</p>
              <div className={styles.spinIndicator}>
                <div
                  className={styles.spinnerIcon}
                  style={{
                    transform: `rotate(${currentHeading}deg)`
                  }}
                >
                  ↻
                </div>
              </div>
            </div>
          )}

          {hasSpun && (
            <div className={styles.pointingPhase}>
              <h2>Point to: {getDirectionName(targetDirection)}</h2>
              <p className={styles.targetDegrees}>{targetDirection}°</p>

              <div className={styles.compassDisplay}>
                <div
                  className={styles.compassNeedle}
                  style={{
                    transform: `rotate(${currentHeading}deg)`
                  }}
                >
                  <div className={styles.needleArrow}>↑</div>
                </div>
                <div
                  className={styles.targetMarker}
                  style={{
                    transform: `rotate(${targetDirection}deg)`
                  }}
                >
                  <div className={styles.targetDot}>🎯</div>
                </div>
              </div>

              <div className={styles.currentHeading}>
                <p>You're pointing: {getDirectionName(currentHeading)}</p>
                <p className={styles.currentDegrees}>{Math.round(currentHeading)}°</p>
                <p className={styles.difference}>Off by: {calculateDifference()}°</p>
              </div>

              <button onClick={submitDirection} className={styles.submitButton}>
                Submit Direction!
              </button>
            </div>
          )}
        </div>
      )}

      {showResults && (
        <div className={styles.resultsScreen}>
          <div className={styles.resultCard}>
            <h2>🎊 Game Complete! 🎊</h2>
            <div className={styles.finalScore}>
              <p className={styles.playerNameResult}>{playerName}</p>
              <p className={styles.scoreValue}>{score}</p>
              <p className={styles.scoreLabel}>Total Points</p>
              <p className={styles.avgScore}>Avg: {Math.round(score / MAX_ROUNDS)} per round</p>
            </div>

            {leaderboard[0]?.name === playerName && leaderboard[0]?.score === score && (
              <div className={styles.champion}>
                <h3>🏆 SPIN MASTER! 🏆</h3>
                <p>(Your internal compass is broken but accurate!)</p>
              </div>
            )}

            <button
              onClick={() => {
                setShowResults(false);
                setPlayerName('');
              }}
              className={styles.playAgainButton}
            >
              Spin Again!
            </button>
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className={styles.leaderboard}>
          <h3>🏆 Spin Masters 🏆</h3>
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
