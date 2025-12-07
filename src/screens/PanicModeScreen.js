import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Input } from '../components';
import { useStore } from '../store/useStore';
import roastEngine from '../services/roastEngine';
import { colors, typography, spacing } from '../theme';

export default function PanicModeScreen({ navigation }) {
  const settings = useStore((state) => state.settings);
  const panicMode = useStore((state) => state.panicMode);
  const startPanicMode = useStore((state) => state.startPanicMode);
  const endPanicMode = useStore((state) => state.endPanicMode);

  const [task, setTask] = useState('');
  const [duration, setDuration] = useState('30');
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startMessage, setStartMessage] = useState('');

  useEffect(() => {
    if (panicMode.active) {
      setStarted(true);
      const start = new Date(panicMode.startTime).getTime();
      const end = start + panicMode.duration * 60 * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);
    }
  }, [panicMode]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  const handleStart = () => {
    if (!task.trim()) {
      alert('Du må velge en task først, dust.');
      return;
    }

    const msg = roastEngine.getContextualRoast({
      type: 'panic',
      stage: 'start',
      roastLevel: settings.roastLevel,
    });

    setStartMessage(msg);
    startPanicMode(task, parseInt(duration) || 30);
    setStarted(true);
    setTimeLeft((parseInt(duration) || 30) * 60);
  };

  const handleComplete = () => {
    // Ask user if they completed the task
    const success = confirm('Did you complete the task?');
    const msg = roastEngine.getContextualRoast({
      type: 'panic',
      stage: success ? 'success' : 'failure',
      roastLevel: settings.roastLevel,
    });

    alert(msg);
    endPanicMode(success);
    navigation.goBack();
  };

  const handleCancel = () => {
    if (started) {
      if (confirm('Gir du opp allerede?')) {
        endPanicMode(false);
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!started ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>🚨 Panic Redemption Mode</Text>
              <Text style={styles.subtitle}>
                Du har fucka dagen. Dette er siste sjanse.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="What are you going to do?"
                placeholder="e.g., Write 500 words"
                value={task}
                onChangeText={setTask}
                multiline
              />

              <Input
                label="Duration (minutes)"
                placeholder="30"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttons}>
              <Button
                variant="ghost"
                onPress={handleCancel}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={handleStart}
                style={styles.button}
              >
                Start Timer
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.timerContainer}>
              <Text style={styles.startMessage}>{startMessage}</Text>

              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>

              <View style={styles.taskBox}>
                <Text style={styles.taskLabel}>Your Task:</Text>
                <Text style={styles.taskText}>{panicMode.task}</Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <Button variant="ghost" onPress={handleCancel}>
                Give Up
              </Button>
              <Button variant="primary" onPress={handleComplete}>
                I'm Done
              </Button>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  buttons: {
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  startMessage: {
    fontSize: typography.fontSize.lg,
    color: colors.accent,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  timerText: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  taskBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    width: '100%',
  },
  taskLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  taskText: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
});
