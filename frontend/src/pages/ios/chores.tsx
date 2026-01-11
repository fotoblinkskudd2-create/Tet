import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Chore {
  id: string;
  title: string;
  emoji: string;
  points: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserStats {
  totalPoints: number;
  streak: number;
  level: number;
  completedToday: number;
}

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([
    { id: '1', title: 'Ta oppvasken', emoji: '🍽️', points: 20, completed: false, difficulty: 'easy' },
    { id: '2', title: 'Støvsug stua', emoji: '🧹', points: 30, completed: false, difficulty: 'medium' },
    { id: '3', title: 'Tøm søpla', emoji: '🗑️', points: 15, completed: false, difficulty: 'easy' },
    { id: '4', title: 'Vask badet', emoji: '🚿', points: 50, completed: false, difficulty: 'hard' },
    { id: '5', title: 'Rydd soverommet', emoji: '🛏️', points: 25, completed: false, difficulty: 'easy' },
    { id: '6', title: 'Vask klær', emoji: '👕', points: 35, completed: false, difficulty: 'medium' },
  ]);

  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    streak: 0,
    level: 1,
    completedToday: 0,
  });

  const [showConfetti, setShowConfetti] = useState(false);

  const toggleChore = (id: string) => {
    setChores(chores.map(chore => {
      if (chore.id === id) {
        const newCompleted = !chore.completed;
        if (newCompleted) {
          setStats(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + chore.points,
            completedToday: prev.completedToday + 1,
            level: Math.floor((prev.totalPoints + chore.points) / 100) + 1,
          }));
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        } else {
          setStats(prev => ({
            ...prev,
            totalPoints: Math.max(0, prev.totalPoints - chore.points),
            completedToday: Math.max(0, prev.completedToday - 1),
            level: Math.floor(Math.max(0, prev.totalPoints - chore.points) / 100) + 1,
          }));
        }
        return { ...chore, completed: newCompleted };
      }
      return chore;
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#999';
    }
  };

  const completionPercentage = (chores.filter(c => c.completed).length / chores.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      color: '#fff',
    }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        fontSize: '14px',
        marginBottom: '20px',
      }}>
        <div>9:41</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}
      >
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 10px 0',
        }}>✨ Hovda Husarbeid ✨</h1>
        <p style={{
          fontSize: '16px',
          opacity: 0.9,
          margin: 0,
        }}>Gjør hverdagen morsom!</p>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '15px',
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalPoints}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Poeng</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Level {stats.level}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Nivå</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.streak} 🔥</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Streak</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          marginTop: '15px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%)',
              borderRadius: '10px',
            }}
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px' }}>
          {Math.round(completionPercentage)}% fullført i dag
        </div>
      </motion.div>

      {/* Chores List */}
      <div style={{ marginBottom: '20px' }}>
        {chores.map((chore, index) => (
          <motion.div
            key={chore.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleChore(chore.id)}
            style={{
              background: chore.completed
                ? 'rgba(76, 175, 80, 0.3)'
                : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '15px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '30px' }}>{chore.emoji}</div>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  textDecoration: chore.completed ? 'line-through' : 'none',
                  opacity: chore.completed ? 0.6 : 1,
                }}>{chore.title}</div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginTop: '2px',
                }}>
                  <span style={{
                    background: getDifficultyColor(chore.difficulty),
                    padding: '2px 8px',
                    borderRadius: '8px',
                    marginRight: '5px',
                  }}>
                    {chore.difficulty}
                  </span>
                  {chore.points} poeng
                </div>
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>
              {chore.completed ? '✅' : '⭕'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
              }}
              transition={{
                duration: 2 + Math.random(),
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                fontSize: '24px',
              }}
            >
              {['🎉', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>🏠</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>Hjem</div>
        </div>
        <Link href="/ios/stats" style={{ textDecoration: 'none', color: '#fff', opacity: 0.7 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>📊</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Stats</div>
          </div>
        </Link>
        <Link href="/ios/rewards" style={{ textDecoration: 'none', color: '#fff', opacity: 0.7 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>🏆</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Belønninger</div>
          </div>
        </Link>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: '24px' }}>⚙️</div>
          <div style={{ fontSize: '10px', marginTop: '2px' }}>Innstillinger</div>
        </div>
      </div>
    </div>
  );
}
