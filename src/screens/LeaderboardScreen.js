import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { Button, Card, Input } from '../components';
import { useStore } from '../store/useStore';
import roastEngine from '../services/roastEngine';
import { colors, typography, spacing } from '../theme';

// Mock leaderboard data
const generateMockLeaderboard = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    nickname: `User${i + 1}`,
    completionRate: Math.random(),
    rank: i + 1,
  })).sort((a, b) => b.completionRate - a.completionRate);
};

export default function LeaderboardScreen() {
  const leaderboardOptIn = useStore(
    (state) => state.settings.leaderboardOptIn
  );
  const userNickname = useStore((state) => state.user.nickname);
  const joinLeaderboard = useStore((state) => state.joinLeaderboard);
  const leaveLeaderboard = useStore((state) => state.leaveLeaderboard);
  const getTodayCompletionRate = useStore((state) => state.getTodayCompletionRate);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // Load mock leaderboard data
    const mockData = generateMockLeaderboard();

    // If user is opted in, add them to the leaderboard
    if (leaderboardOptIn && userNickname) {
      const userRate = getTodayCompletionRate();
      const userEntry = {
        id: 'user',
        nickname: userNickname,
        completionRate: userRate,
        rank: 0,
        isCurrentUser: true,
      };

      const combined = [...mockData, userEntry].sort(
        (a, b) => b.completionRate - a.completionRate
      );

      combined.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboardData(combined);
    } else {
      setLeaderboardData(mockData);
    }
  }, [leaderboardOptIn, userNickname]);

  const handleJoin = () => {
    if (nickname.trim()) {
      joinLeaderboard(nickname);
      setJoinModalVisible(false);
      setNickname('');
    }
  };

  const handleLeave = () => {
    if (confirm('Er du sikker på at du vil forlate leaderboard?')) {
      leaveLeaderboard();
    }
  };

  const getRankTitle = (rank, completionRate) => {
    const percentile = rank / leaderboardData.length;
    return roastEngine.getContextualRoast({
      type: 'leaderboard',
      rankPercentile: 1 - percentile,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>
              {leaderboardOptIn
                ? 'Du er synlig for alle. God å ha.'
                : 'Anonymous. For now.'}
            </Text>
          </View>

          {/* Join/Leave Section */}
          {!leaderboardOptIn ? (
            <Card variant="highlighted">
              <Text style={styles.joinTitle}>Join the Leaderboard</Text>
              <Text style={styles.joinText}>
                Vil du vise verden hvor mye (eller lite) du får gjort?
              </Text>
              <Button onPress={() => setJoinModalVisible(true)}>
                Join Now
              </Button>
            </Card>
          ) : (
            <Card>
              <View style={styles.userInfo}>
                <View>
                  <Text style={styles.userNickname}>@{userNickname}</Text>
                  <Text style={styles.userRate}>
                    {Math.round(getTodayCompletionRate() * 100)}% completion
                  </Text>
                </View>
                <Button variant="ghost" onPress={handleLeave} size="small">
                  Leave
                </Button>
              </View>
            </Card>
          )}

          {/* Leaderboard List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rankings</Text>

            {leaderboardData.map((entry) => {
              const title = getRankTitle(entry.rank, entry.completionRate);

              return (
                <Card
                  key={entry.id}
                  variant={entry.isCurrentUser ? 'highlighted' : 'default'}
                >
                  <View style={styles.leaderboardRow}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{entry.rank}</Text>
                    </View>

                    <View style={styles.userDetails}>
                      <Text
                        style={[
                          styles.nicknameText,
                          entry.isCurrentUser && styles.currentUserText,
                        ]}
                      >
                        {entry.nickname}
                        {entry.isCurrentUser && ' (You)'}
                      </Text>
                      <Text style={styles.titleText}>{title}</Text>
                    </View>

                    <View style={styles.rateContainer}>
                      <Text style={styles.rateValue}>
                        {Math.round(entry.completionRate * 100)}%
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Join Modal */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Nickname</Text>
            <Text style={styles.modalSubtitle}>
              Velg et kallenavn. Alle kan se det.
            </Text>

            <Input
              placeholder="Enter nickname"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />

            <View style={styles.modalButtons}>
              <Button
                variant="ghost"
                onPress={() => setJoinModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleJoin}
                disabled={!nickname.trim()}
                style={styles.modalButton}
              >
                Join
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  joinTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  joinText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userNickname: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  userRate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  userDetails: {
    flex: 1,
  },
  nicknameText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  currentUserText: {
    color: colors.accent,
  },
  titleText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
