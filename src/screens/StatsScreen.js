import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Card, ProgressRing } from '../components';
import { useStore } from '../store/useStore';
import roastEngine from '../services/roastEngine';
import { colors, typography, spacing } from '../theme';

export default function StatsScreen() {
  const habits = useStore((state) => state.habits);
  const stats = useStore((state) => state.stats);
  const settings = useStore((state) => state.settings);
  const getTodayCompletionRate = useStore((state) => state.getTodayCompletionRate);

  const [statsSummary, setStatsSummary] = useState('');

  useEffect(() => {
    const completionRate = stats.weeklyCompletion;
    const summary = roastEngine.getContextualRoast({
      type: 'stats',
      completionRate,
      roastLevel: settings.roastLevel,
    });
    setStatsSummary(summary);
  }, [stats, settings.roastLevel]);

  // Calculate weekly data
  const getWeeklyData = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const dayName = format(subDays(new Date(), 6 - i), 'EEE');

      const dayHabits = habits.map((h) => {
        const completion = h.completions.find((c) => c.date === date);
        return completion?.completed || false;
      });

      const completionRate = dayHabits.length > 0
        ? dayHabits.filter(Boolean).length / dayHabits.length
        : 0;

      days.push({
        date,
        dayName,
        completionRate,
      });
    }

    return days;
  };

  const weeklyData = getWeeklyData();

  // Find most broken habit
  const getMostBrokenHabit = () => {
    if (habits.length === 0) return null;

    const habitStats = habits.map((habit) => {
      const total = habit.completions.length;
      const failed = habit.completions.filter((c) => !c.completed).length;
      return {
        habit,
        failRate: total > 0 ? failed / total : 0,
      };
    });

    habitStats.sort((a, b) => b.failRate - a.failRate);
    return habitStats[0];
  };

  const mostBroken = getMostBrokenHabit();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Stats & Shame</Text>
            <Text style={styles.roast}>{statsSummary}</Text>
          </View>

          {/* Overall Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall</Text>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalCompletions}</Text>
                <Text style={styles.statLabel}>Completions</Text>
              </Card>

              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalFailures}</Text>
                <Text style={styles.statLabel}>Failures</Text>
              </Card>

              <Card style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Math.round(stats.weeklyCompletion * 100)}%
                </Text>
                <Text style={styles.statLabel}>Weekly Rate</Text>
              </Card>

              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </Card>
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last 7 Days</Text>

            <Card>
              <View style={styles.weeklyChart}>
                {weeklyData.map((day) => (
                  <View key={day.date} style={styles.dayBar}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${day.completionRate * 100}%`,
                            backgroundColor:
                              day.completionRate >= 0.7
                                ? colors.success
                                : colors.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.dayLabel}>{day.dayName}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* Habit Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit Breakdown</Text>

            {habits.map((habit) => {
              const total = habit.completions.length;
              const completed = habit.completions.filter(
                (c) => c.completed
              ).length;
              const rate = total > 0 ? completed / total : 0;

              return (
                <Card key={habit.id}>
                  <View style={styles.habitRow}>
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitName}>{habit.title}</Text>
                      <Text style={styles.habitStats}>
                        {completed}/{total} completed
                      </Text>
                    </View>
                    <ProgressRing progress={rate} size={50} />
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Most Broken Habit */}
          {mostBroken && mostBroken.failRate > 0.5 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hall of Shame</Text>

              <Card variant="highlighted">
                <Text style={styles.shameTitle}>Most Broken Habit</Text>
                <Text style={styles.shameName}>
                  {mostBroken.habit.title}
                </Text>
                <Text style={styles.shameRate}>
                  {Math.round(mostBroken.failRate * 100)}% failure rate
                </Text>
                <Text style={styles.shameComment}>
                  Du klarer virkelig ikke denne, gjør du?
                </Text>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: spacing.sm,
  },
  roast: {
    fontSize: typography.fontSize.base,
    color: colors.accent,
    fontStyle: 'italic',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingVertical: spacing.md,
  },
  dayBar: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  barContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.gray800,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  habitStats: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  shameTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  shameName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  shameRate: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  shameComment: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
