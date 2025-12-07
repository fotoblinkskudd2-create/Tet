import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { format } from 'date-fns';
import { Button, Card, Input, ProgressRing } from '../components';
import { useStore } from '../store/useStore';
import roastEngine from '../services/roastEngine';
import { colors, typography, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const habits = useStore((state) => state.habits);
  const settings = useStore((state) => state.settings);
  const toggleHabitCompletion = useStore((state) => state.toggleHabitCompletion);
  const getTodayCompletionRate = useStore((state) => state.getTodayCompletionRate);
  const startPanicMode = useStore((state) => state.startPanicMode);

  const [dailyRoast, setDailyRoast] = useState('');
  const [explainModalVisible, setExplainModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [explanation, setExplanation] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  useEffect(() => {
    const completionRate = getTodayCompletionRate();
    const roast = roastEngine.getContextualRoast({
      type: 'daily',
      completionRate,
      roastLevel: settings.roastLevel,
    });
    setDailyRoast(roast);
  }, [habits, settings.roastLevel]);

  const handleToggleHabit = (habitId) => {
    toggleHabitCompletion(habitId, today);
  };

  const handleSnooze = (habitId) => {
    const snoozeMessage = roastEngine.getContextualRoast({
      type: 'snooze',
      roastLevel: settings.roastLevel,
    });
    alert(snoozeMessage);
  };

  const handleExplain = (habitId) => {
    setSelectedHabit(habitId);
    setExplainModalVisible(true);
  };

  const submitExplanation = () => {
    // For now, just log it. Could be saved to habit note
    console.log('Explanation for habit:', selectedHabit, explanation);
    setExplainModalVisible(false);
    setExplanation('');
    setSelectedHabit(null);
  };

  const getHabitStatus = (habit) => {
    const completion = habit.completions.find((c) => c.date === today);
    return completion?.completed || false;
  };

  const completionRate = getTodayCompletionRate();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header with date and completion */}
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>{todayFormatted}</Text>
              <Text style={styles.roast}>{dailyRoast}</Text>
            </View>
            <ProgressRing progress={completionRate} size={70} />
          </View>

          {/* Today's Habits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>

            {habits.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>
                  No habits yet. Go to settings to add some.
                </Text>
              </Card>
            ) : (
              habits.map((habit) => {
                const isCompleted = getHabitStatus(habit);
                return (
                  <Card
                    key={habit.id}
                    variant={isCompleted ? 'success' : 'default'}
                  >
                    <View style={styles.habitCard}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => handleToggleHabit(habit.id)}
                      >
                        <View
                          style={[
                            styles.checkboxInner,
                            isCompleted && styles.checkboxChecked,
                          ]}
                        >
                          {isCompleted && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      <View style={styles.habitContent}>
                        <Text
                          style={[
                            styles.habitTitle,
                            isCompleted && styles.habitTitleCompleted,
                          ]}
                        >
                          {habit.title}
                        </Text>
                      </View>

                      <View style={styles.habitActions}>
                        <TouchableOpacity
                          onPress={() => handleSnooze(habit.id)}
                          style={styles.actionButton}
                        >
                          <Text style={styles.actionText}>💤</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleExplain(habit.id)}
                          style={styles.actionButton}
                        >
                          <Text style={styles.actionText}>💬</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>

          {/* Panic Button */}
          {completionRate < 0.3 && (
            <View style={styles.panicSection}>
              <Card variant="highlighted">
                <Text style={styles.panicTitle}>
                  Dagen er fucked. Vil du redde den?
                </Text>
                <Button
                  onPress={() => navigation.navigate('PanicMode')}
                  variant="danger"
                >
                  🚨 Panic Redemption Mode
                </Button>
              </Card>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {habits.filter((h) => getHabitStatus(h)).length}/{habits.length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Math.round(completionRate * 100)}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Explain Yourself Modal */}
      <Modal
        visible={explainModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExplainModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Explain yourself</Text>
            <Text style={styles.modalSubtitle}>
              The app will judge you, but at least it's logged.
            </Text>

            <Input
              multiline
              numberOfLines={4}
              placeholder="Type your excuse here..."
              value={explanation}
              onChangeText={setExplanation}
            />

            <View style={styles.modalButtons}>
              <Button
                variant="ghost"
                onPress={() => setExplainModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                onPress={submitExplanation}
                style={styles.modalButton}
              >
                Submit
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roast: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    maxWidth: '70%',
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    padding: spacing.xs,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  habitActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionText: {
    fontSize: 20,
  },
  panicSection: {
    marginBottom: spacing.xl,
  },
  panicTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  quickStats: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
