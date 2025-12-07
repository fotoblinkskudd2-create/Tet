import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, Input, Card } from '../components';
import { useStore } from '../store/useStore';
import { personas, roastLevels } from '../data/personas';
import { colors, typography, spacing } from '../theme';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    habits: [],
    newHabit: '',
    wakeUpTime: '07:00',
    workStart: '09:00',
    workEnd: '17:00',
    dndStart: '22:00',
    dndEnd: '07:00',
    roastLevel: 'normal',
    persona: 'coldCeo',
  });

  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const addHabit = () => {
    if (formData.newHabit.trim()) {
      setFormData({
        ...formData,
        habits: [...formData.habits, { title: formData.newHabit, frequency: 7 }],
        newHabit: '',
      });
    }
  };

  const removeHabit = (index) => {
    setFormData({
      ...formData,
      habits: formData.habits.filter((_, i) => i !== index),
    });
  };

  const handleComplete = () => {
    const data = {
      settings: {
        roastLevel: formData.roastLevel,
        persona: formData.persona,
        wakeUpTime: formData.wakeUpTime,
        workHours: { start: formData.workStart, end: formData.workEnd },
        doNotDisturb: { start: formData.dndStart, end: formData.dndEnd },
      },
      habits: formData.habits,
    };

    completeOnboarding(data);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What do you want to fix?</Text>
            <Text style={styles.stepDescription}>
              Add 3-7 habits or goals you want to track
            </Text>

            <Input
              placeholder="e.g., Tren 3x i uka"
              value={formData.newHabit}
              onChangeText={(text) =>
                setFormData({ ...formData, newHabit: text })
              }
              onSubmitEditing={addHabit}
            />
            <Button onPress={addHabit} variant="secondary">
              Add Habit
            </Button>

            {formData.habits.length > 0 && (
              <View style={styles.habitList}>
                {formData.habits.map((habit, index) => (
                  <Card key={index} style={styles.habitCard}>
                    <View style={styles.habitItem}>
                      <Text style={styles.habitText}>{habit.title}</Text>
                      <TouchableOpacity onPress={() => removeHabit(index)}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <Button
              onPress={() => setStep(2)}
              disabled={formData.habits.length < 3}
            >
              Next
            </Button>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Schedule</Text>
            <Text style={styles.stepDescription}>
              When should we check on you?
            </Text>

            <Input
              label="Wake up time"
              value={formData.wakeUpTime}
              onChangeText={(text) =>
                setFormData({ ...formData, wakeUpTime: text })
              }
              placeholder="07:00"
            />
            <Input
              label="Work hours start"
              value={formData.workStart}
              onChangeText={(text) =>
                setFormData({ ...formData, workStart: text })
              }
              placeholder="09:00"
            />
            <Input
              label="Work hours end"
              value={formData.workEnd}
              onChangeText={(text) =>
                setFormData({ ...formData, workEnd: text })
              }
              placeholder="17:00"
            />

            <View style={styles.buttonRow}>
              <Button
                onPress={() => setStep(1)}
                variant="ghost"
                style={styles.halfButton}
              >
                Back
              </Button>
              <Button onPress={() => setStep(3)} style={styles.halfButton}>
                Next
              </Button>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Your Roast Level</Text>
            <Text style={styles.stepDescription}>
              How brutal should we be?
            </Text>

            {Object.values(roastLevels).map((level) => (
              <Card
                key={level.id}
                variant={
                  formData.roastLevel === level.id ? 'highlighted' : 'default'
                }
                onPress={() =>
                  setFormData({ ...formData, roastLevel: level.id })
                }
              >
                <Text style={styles.optionTitle}>{level.name}</Text>
                <Text style={styles.optionDescription}>
                  {level.description}
                </Text>
              </Card>
            ))}

            <View style={styles.buttonRow}>
              <Button
                onPress={() => setStep(2)}
                variant="ghost"
                style={styles.halfButton}
              >
                Back
              </Button>
              <Button onPress={() => setStep(4)} style={styles.halfButton}>
                Next
              </Button>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Your Persona</Text>
            <Text style={styles.stepDescription}>
              Who should deliver the truth?
            </Text>

            {Object.values(personas).map((persona) => (
              <Card
                key={persona.id}
                variant={
                  formData.persona === persona.id ? 'highlighted' : 'default'
                }
                onPress={() =>
                  setFormData({ ...formData, persona: persona.id })
                }
              >
                <Text style={styles.personaIcon}>{persona.icon}</Text>
                <Text style={styles.optionTitle}>{persona.name}</Text>
                <Text style={styles.optionDescription}>
                  {persona.description}
                </Text>
              </Card>
            ))}

            <View style={styles.buttonRow}>
              <Button
                onPress={() => setStep(3)}
                variant="ghost"
                style={styles.halfButton}
              >
                Back
              </Button>
              <Button onPress={handleComplete} style={styles.halfButton}>
                Let's Go
              </Button>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  s <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {renderStep()}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray800,
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
  },
  stepContainer: {
    gap: spacing.md,
  },
  stepTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  habitList: {
    gap: spacing.sm,
  },
  habitCard: {
    padding: spacing.md,
    marginBottom: 0,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  removeButton: {
    fontSize: typography.fontSize.xl,
    color: colors.accent,
    paddingLeft: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  personaIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
});
