import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function PsychoticPomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [message, setMessage] = useState('');
  const [glitch, setGlitch] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    setSessions(sessions + 1);
    triggerGlitch();

    // Fetch psychotic message from Claude
    try {
      const response = await fetch('/api/pomodoro/message');
      const data = await response.json();
      setMessage(data.message);
      setShowMessage(true);

      // Hide message after 10 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 10000);
    } catch (error) {
      setMessage('DU ER EN KJØTTSEKK SOM PUSTER FOR MYE – STÅ OPP OG KNUS VERDEN');
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 10000);
    }

    // Play disturbing sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const triggerGlitch = () => {
    setGlitch(true);
    const glitchDuration = Math.random() * 3000 + 2000; // 2-5 seconds

    const glitchInterval = setInterval(() => {
      setGlitch((prev) => !prev);
    }, Math.random() * 200 + 50);

    setTimeout(() => {
      clearInterval(glitchInterval);
      setGlitch(false);
    }, glitchDuration);
  };

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>PSYKOTISK POMODORO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`container ${glitch ? 'glitch' : ''}`}>
        <div className="background-effects">
          <div className="scan-line"></div>
          <div className="static"></div>
        </div>

        <div className="timer-container">
          <h1 className="title">
            <span className="glitch-text" data-text="PSYKOTISK">PSYKOTISK</span>
            <br />
            <span className="glitch-text" data-text="POMODORO">POMODORO</span>
          </h1>

          <div className="timer-display">
            <div className="time">{formatTime(timeLeft)}</div>
            <div className="sessions">Økter fullført: {sessions}</div>
          </div>

          <div className="controls">
            {!isActive ? (
              <button className="btn btn-start" onClick={startTimer}>
                START
              </button>
            ) : (
              <>
                <button className="btn btn-pause" onClick={pauseTimer}>
                  {isPaused ? 'FORTSETT' : 'PAUSE'}
                </button>
                <button className="btn btn-reset" onClick={resetTimer}>
                  RESET
                </button>
              </>
            )}
          </div>

          {showMessage && (
            <div className="message-container">
              <div className="psychotic-message">
                {message}
              </div>
            </div>
          )}
        </div>

        <audio ref={audioRef} src="/sounds/disturbing.mp3" />
      </div>

      <style jsx>{`
        @keyframes glitch-anim {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, 2px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(2px, -2px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-2px, 2px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(2px, -2px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(-2px, 2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(2px, -2px);
          }
        }

        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }

        @keyframes static-anim {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100% 100%;
          }
        }

        @keyframes flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .container {
          min-height: 100vh;
          background: #000;
          color: #ff0000;
          font-family: 'Courier New', monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .container.glitch {
          animation: flicker 0.1s infinite;
        }

        .background-effects {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: rgba(255, 0, 0, 0.3);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
          animation: scan 4s linear infinite;
        }

        .static {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 0, 0, 0.03) 0px,
            rgba(255, 0, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: static-anim 0.2s infinite;
          opacity: 0.4;
        }

        .timer-container {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 2rem;
          border: 3px solid #ff0000;
          background: rgba(0, 0, 0, 0.9);
          box-shadow:
            0 0 20px rgba(255, 0, 0, 0.5),
            inset 0 0 20px rgba(255, 0, 0, 0.1);
          max-width: 600px;
          width: 90%;
        }

        .title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-shadow:
            0 0 10px #ff0000,
            0 0 20px #ff0000,
            0 0 30px #ff0000;
        }

        .glitch-text {
          position: relative;
          display: inline-block;
        }

        .glitch .glitch-text::before,
        .glitch .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch .glitch-text::before {
          animation: glitch-anim 0.3s infinite;
          color: #0ff;
          z-index: -1;
        }

        .glitch .glitch-text::after {
          animation: glitch-anim 0.4s infinite reverse;
          color: #f0f;
          z-index: -2;
        }

        .timer-display {
          margin: 3rem 0;
        }

        .time {
          font-size: 6rem;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-shadow:
            0 0 10px #ff0000,
            0 0 20px #ff0000;
        }

        .sessions {
          font-size: 1.2rem;
          margin-top: 1rem;
          color: #ff6666;
        }

        .controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn {
          padding: 1rem 2rem;
          font-size: 1.2rem;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          border: 2px solid;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .btn-start {
          color: #00ff00;
          border-color: #00ff00;
        }

        .btn-start:hover {
          background: #00ff00;
          color: #000;
          box-shadow: 0 0 20px #00ff00;
        }

        .btn-pause {
          color: #ffff00;
          border-color: #ffff00;
        }

        .btn-pause:hover {
          background: #ffff00;
          color: #000;
          box-shadow: 0 0 20px #ffff00;
        }

        .btn-reset {
          color: #ff0000;
          border-color: #ff0000;
        }

        .btn-reset:hover {
          background: #ff0000;
          color: #000;
          box-shadow: 0 0 20px #ff0000;
        }

        .message-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: flicker 0.2s infinite;
        }

        .psychotic-message {
          font-size: 2.5rem;
          font-weight: bold;
          color: #ff0000;
          text-align: center;
          padding: 2rem;
          max-width: 80%;
          text-shadow:
            0 0 10px #ff0000,
            0 0 20px #ff0000,
            0 0 30px #ff0000,
            0 0 40px #ff0000;
          animation: glitch-anim 0.3s infinite;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .title {
            font-size: 2rem;
          }
          .time {
            font-size: 4rem;
          }
          .psychotic-message {
            font-size: 1.5rem;
          }
          .btn {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
