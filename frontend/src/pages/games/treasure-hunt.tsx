import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getGPSLocation, watchGPSLocation, calculateDistance, calculateBearing, startGyroscope } from '../../utils/sensors';
import styles from '../../styles/TreasureGame.module.css';

interface TargetLocation {
  latitude: number;
  longitude: number;
}

export default function TreasureHunt() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [targetLocation, setTargetLocation] = useState<TargetLocation | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);
  const [phoneHeading, setPhoneHeading] = useState<number>(0);
  const [hasWon, setHasWon] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const stopGPSRef = useRef<(() => void) | null>(null);
  const stopGyroRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const WIN_DISTANCE = 10; // meters

  const generateRandomTarget = (currentLat: number, currentLon: number): TargetLocation => {
    // Generate a random point 50-200 meters away
    const distanceMeters = 50 + Math.random() * 150;
    const angle = Math.random() * 2 * Math.PI;

    // Convert distance to degrees (approximate)
    const latOffset = (distanceMeters * Math.cos(angle)) / 111320;
    const lonOffset = (distanceMeters * Math.sin(angle)) / (111320 * Math.cos(currentLat * Math.PI / 180));

    return {
      latitude: currentLat + latOffset,
      longitude: currentLon + lonOffset
    };
  };

  const startGame = async () => {
    try {
      // Get initial GPS location
      const location = await getGPSLocation();
      setCurrentLocation({ lat: location.latitude, lon: location.longitude });

      // Generate random target
      const target = generateRandomTarget(location.latitude, location.longitude);
      setTargetLocation(target);

      // Calculate initial distance and bearing
      const dist = calculateDistance(location.latitude, location.longitude, target.latitude, target.longitude);
      const bear = calculateBearing(location.latitude, location.longitude, target.latitude, target.longitude);

      setDistance(dist);
      setBearing(bear);

      setIsPlaying(true);
      setHasWon(false);
      setTimeElapsed(0);

      // Start watching GPS
      const cleanupGPS = watchGPSLocation((gpsData) => {
        setCurrentLocation({ lat: gpsData.latitude, lon: gpsData.longitude });

        if (target) {
          const newDist = calculateDistance(gpsData.latitude, gpsData.longitude, target.latitude, target.longitude);
          const newBear = calculateBearing(gpsData.latitude, gpsData.longitude, target.latitude, target.longitude);

          setDistance(newDist);
          setBearing(newBear);

          // Check if won
          if (newDist <= WIN_DISTANCE && !hasWon) {
            setHasWon(true);
          }
        }
      });

      stopGPSRef.current = cleanupGPS;

      // Start gyroscope for compass heading
      const cleanupGyro = await startGyroscope((data) => {
        if (data.alpha !== null) {
          setPhoneHeading(data.alpha);
        }
      });

      stopGyroRef.current = cleanupGyro;

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

    } catch (error) {
      alert('Failed to get GPS location. Please enable location services!');
      console.error(error);
    }
  };

  const stopGame = () => {
    setIsPlaying(false);

    if (stopGPSRef.current) {
      stopGPSRef.current();
      stopGPSRef.current = null;
    }

    if (stopGyroRef.current) {
      stopGyroRef.current();
      stopGyroRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (stopGPSRef.current) stopGPSRef.current();
      if (stopGyroRef.current) stopGyroRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getHotColdLevel = () => {
    if (distance < 15) return { text: 'ON FIRE! 🔥🔥🔥', color: '#F44336' };
    if (distance < 30) return { text: 'HOT! 🔥', color: '#FF5722' };
    if (distance < 50) return { text: 'Warm 🌡️', color: '#FF9800' };
    if (distance < 80) return { text: 'Cool 🧊', color: '#2196F3' };
    if (distance < 120) return { text: 'Cold ❄️', color: '#03A9F4' };
    return { text: 'FREEZING! 🥶', color: '#00BCD4' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate arrow rotation (bearing - phone heading)
  const arrowRotation = bearing - phoneHeading;

  const hotCold = getHotColdLevel();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back to Games
        </Link>
        <h1 className={styles.title}>
          🗺️ GPS Treasure Hunt 🗺️
        </h1>
        <p className={styles.subtitle}>
          Navigate to the hidden treasure. Hot or cold?
        </p>
      </div>

      {!isPlaying && !hasWon && (
        <div className={styles.setupScreen}>
          <button onClick={startGame} className={styles.startButton}>
            Start Hunt! 🎯
          </button>

          <div className={styles.instructions}>
            <h3>How to Play:</h3>
            <ol>
              <li>Press "Start Hunt!" to generate a random treasure location</li>
              <li>Follow the arrow to find the treasure</li>
              <li>The color tells you how close you are (hot/cold)</li>
              <li>Get within 10 meters to win!</li>
              <li>Don't walk into traffic while drunk!</li>
            </ol>
            <p className={styles.warning}>⚠️ Stay safe! Watch where you're going!</p>
          </div>
        </div>
      )}

      {isPlaying && !hasWon && (
        <div className={styles.gameScreen}>
          <div className={styles.timer}>
            <h3>{formatTime(timeElapsed)}</h3>
          </div>

          <div className={styles.compassContainer}>
            <div
              className={styles.arrow}
              style={{
                transform: `rotate(${arrowRotation}deg)`,
                color: hotCold.color
              }}
            >
              ↑
            </div>
            <div className={styles.compassRing}>
              <span className={styles.north}>N</span>
              <span className={styles.east}>E</span>
              <span className={styles.south}>S</span>
              <span className={styles.west}>W</span>
            </div>
          </div>

          <div className={styles.distanceDisplay}>
            <h2 style={{ color: hotCold.color }}>
              {Math.round(distance)}m
            </h2>
            <p className={styles.distanceLabel}>Distance to Treasure</p>
          </div>

          <div
            className={styles.hotColdIndicator}
            style={{ background: hotCold.color }}
          >
            <h2>{hotCold.text}</h2>
          </div>

          <div className={styles.locationInfo}>
            {currentLocation && (
              <>
                <p>Your Location:</p>
                <p className={styles.coords}>
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lon.toFixed(6)}
                </p>
              </>
            )}
          </div>

          <button onClick={stopGame} className={styles.quitButton}>
            Give Up
          </button>
        </div>
      )}

      {hasWon && (
        <div className={styles.winScreen}>
          <div className={styles.winCard}>
            <h2>🎉 YOU FOUND IT! 🎉</h2>
            <div className={styles.winInfo}>
              <p className={styles.winTime}>Time: {formatTime(timeElapsed)}</p>
              <p className={styles.winMessage}>
                You navigated {Math.round(distance)}m while drunk!
              </p>
              <p className={styles.winSubtext}>
                (We're impressed you didn't trip)
              </p>
            </div>

            <button
              onClick={() => {
                setHasWon(false);
                stopGame();
              }}
              className={styles.playAgainButton}
            >
              Hunt Again!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
