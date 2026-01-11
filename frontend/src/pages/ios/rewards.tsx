import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Reward {
  id: string;
  title: string;
  description: string;
  emoji: string;
  cost: number;
  unlocked: boolean;
}

export default function RewardsPage() {
  const [userPoints] = useState(150);
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Pizza Kveld',
      description: 'Bestill din favoritt pizza!',
      emoji: '🍕',
      cost: 100,
      unlocked: false,
    },
    {
      id: '2',
      title: 'Film Kveld',
      description: 'Se en film du velger selv',
      emoji: '🎬',
      cost: 80,
      unlocked: false,
    },
    {
      id: '3',
      title: 'Gaming Time',
      description: '2 timer ekstra gaming',
      emoji: '🎮',
      cost: 60,
      unlocked: false,
    },
    {
      id: '4',
      title: 'Iskrem',
      description: 'Velg din favoritt iskrem',
      emoji: '🍦',
      cost: 40,
      unlocked: false,
    },
    {
      id: '5',
      title: 'Godteri',
      description: 'Godtepose fra butikken',
      emoji: '🍬',
      cost: 30,
      unlocked: false,
    },
    {
      id: '6',
      title: 'Sengetid +30min',
      description: 'Bli oppe 30 min lengre',
      emoji: '🌙',
      cost: 50,
      unlocked: false,
    },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);

  const unlockReward = (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (reward && userPoints >= reward.cost && !reward.unlocked) {
      setRewards(rewards.map(r =>
        r.id === id ? { ...r, unlocked: true } : r
      ));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
        }}>🏆 Belønninger</h1>
      </div>

      {/* Points Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '10px' }}>
          Dine poeng
        </div>
        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
          {userPoints} ⭐
        </div>
      </motion.div>

      {/* Rewards Grid */}
      <div style={{
        display: 'grid',
        gap: '15px',
      }}>
        {rewards.map((reward, index) => {
          const canAfford = userPoints >= reward.cost;
          return (
            <motion.div
              key={reward.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: canAfford && !reward.unlocked ? 0.98 : 1 }}
              onClick={() => unlockReward(reward.id)}
              style={{
                background: reward.unlocked
                  ? 'rgba(76, 175, 80, 0.3)'
                  : canAfford
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                cursor: canAfford && !reward.unlocked ? 'pointer' : 'default',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                opacity: reward.unlocked ? 0.6 : 1,
              }}
            >
              <div style={{ fontSize: '50px' }}>{reward.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '5px',
                }}>
                  {reward.title}
                  {reward.unlocked && ' ✅'}
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '8px',
                }}>
                  {reward.description}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: canAfford && !reward.unlocked
                    ? 'rgba(76, 175, 80, 0.5)'
                    : 'rgba(0, 0, 0, 0.2)',
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px',
                }}>
                  {reward.cost} poeng
                </div>
              </div>
              {!reward.unlocked && !canAfford && (
                <div style={{ fontSize: '24px', opacity: 0.3 }}>🔒</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(76, 175, 80, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: '600',
            zIndex: 1000,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          🎉 Belønning låst opp!
        </motion.div>
      )}
    </div>
  );
}
