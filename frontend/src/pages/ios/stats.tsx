import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DayStats {
  day: string;
  completed: number;
  total: number;
}

export default function StatsPage() {
  const [weeklyStats] = useState<DayStats[]>([
    { day: 'Man', completed: 4, total: 6 },
    { day: 'Tir', completed: 5, total: 6 },
    { day: 'Ons', completed: 3, total: 6 },
    { day: 'Tor', completed: 6, total: 6 },
    { day: 'Fre', completed: 4, total: 6 },
    { day: 'Lør', completed: 2, total: 6 },
    { day: 'Søn', completed: 5, total: 6 },
  ]);

  const [achievements] = useState([
    { id: '1', title: 'First Step', description: 'Fullført første oppgave', emoji: '🎯', unlocked: true },
    { id: '2', title: 'Week Warrior', description: '7 dager på rad', emoji: '🔥', unlocked: true },
    { id: '3', title: 'Point Master', description: 'Samlet 500 poeng', emoji: '⭐', unlocked: false },
    { id: '4', title: 'Speed Demon', description: '10 oppgaver på én dag', emoji: '⚡', unlocked: false },
    { id: '5', title: 'Legendary', description: '30 dager streak', emoji: '👑', unlocked: false },
  ]);

  const totalCompleted = weeklyStats.reduce((sum, day) => sum + day.completed, 0);
  const totalPossible = weeklyStats.reduce((sum, day) => sum + day.total, 0);
  const weeklyCompletion = Math.round((totalCompleted / totalPossible) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      color: '#fff',
      paddingBottom: '100px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0',
      }}>
        <Link href="/ios/chores" style={{ textDecoration: 'none', color: '#fff' }}>
          <div style={{ fontSize: '24px' }}>←</div>
        </Link>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          margin: '0',
          marginLeft: '15px',
        }}>📊 Statistikk</h1>
      </div>

      {/* Weekly Summary */}
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
        <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '15px' }}>
          Denne uken
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          height: '150px',
          marginBottom: '15px',
        }}>
          {weeklyStats.map((day, index) => {
            const percentage = (day.completed / day.total) * 100;
            return (
              <div key={day.day} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  style={{
                    width: '30px',
                    background: percentage === 100
                      ? 'linear-gradient(180deg, #00d2ff 0%, #3a47d5 100%)'
                      : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    minHeight: '10px',
                  }}
                />
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {day.day}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.6 }}>
                  {day.completed}/{day.total}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '10px',
        }}>
          {weeklyCompletion}% fullført denne uken 🎉
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>12</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Troféer</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>7</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Dager streak</div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>
          Prestasjoner
        </h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              style={{
                background: achievement.unlocked
                  ? 'rgba(255, 215, 0, 0.3)'
                  : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                opacity: achievement.unlocked ? 1 : 0.5,
              }}
            >
              <div style={{
                fontSize: '40px',
                filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
              }}>
                {achievement.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '3px',
                }}>
                  {achievement.title}
                  {achievement.unlocked && ' ✅'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {achievement.description}
                </div>
              </div>
              {!achievement.unlocked && (
                <div style={{ fontSize: '20px', opacity: 0.3 }}>🔒</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
