import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { Button, Card, Input } from '../components';
import { useStore } from '../store/useStore';
import { personas, roastLevels } from '../data/personas';
import { colors, typography, spacing } from '../theme';

export default function SettingsScreen() {
  const settings = useStore((state) => state.settings);
  const habits = useStore((state) => state.habits);
  const updateSettings = useStore((state) => state.updateSettings);
  const addHabit = useStore((state) => state.addHabit);
  const deleteHabit = useStore((state) => state.deleteHabit);
  const resetApp = useStore((state) => state.resetApp);

  const [addHabitModalVisible, setAddHabitModalVisible] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const handleAddHabit = () => {
    if (newHabitTitle.trim()) {
      addHabit({ title: newHabitTitle, frequency: 7 });
      setNewHabitTitle('');
      setAddHabitModalVisible(false);
    }
  };

  const handleDeleteHabit = (habitId, habitTitle) => {
    if (confirm(`Delete "${habitTitle}"?`)) {
      deleteHabit(habitId);
    }
  };

  const handleResetApp = () => {
    if (confirm('This will delete ALL your data. Are you absolutely sure?')) {
      if (confirm('Last chance. Really delete everything?')) {
        resetApp();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Habits Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Habits</Text>
              <Button
                size="small"
                onPress={() => setAddHabitModalVisible(true)}
              >
                + Add
              </Button>
            </View>

            {habits.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>
                  No habits yet. Add some to get started.
                </Text>
              </Card>
            ) : (
              habits.map((habit) => (
                <Card key={habit.id}>
                  <View style={styles.habitRow}>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteHabit(habit.id, habit.title)}
                    >
                      <Text style={styles.deleteButton}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>

          {/* Roast Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Roast Level</Text>

            {Object.values(roastLevels).map((level) => (
              <Card
                key={level.id}
                variant={
                  settings.roastLevel === level.id ? 'highlighted' : 'default'
                }
                onPress={() => updateSettings({ roastLevel: level.id })}
              >
                <Text style={styles.optionTitle}>{level.name}</Text>
                <Text style={styles.optionDescription}>
                  {level.description}
                </Text>
              </Card>
            ))}
          </View>

          {/* Persona */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tone Persona</Text>

            {Object.values(personas).map((persona) => (
              <Card
                key={persona.id}
                variant={
                  settings.persona === persona.id ? 'highlighted' : 'default'
                }
                onPress={() => updateSettings({ persona: persona.id })}
              >
                <View style={styles.personaRow}>
                  <Text style={styles.personaIcon}>{persona.icon}</Text>
                  <View style={styles.personaInfo}>
                    <Text style={styles.optionTitle}>{persona.name}</Text>
                    <Text style={styles.optionDescription}>
                      {persona.description}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <Card>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable Notifications</Text>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(value) =>
                    updateSettings({ notificationsEnabled: value })
                  }
                  trackColor={{
                    false: colors.gray700,
                    true: colors.accent,
                  }}
                  thumbColor={colors.white}
                />
              </View>
            </Card>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>

            <Card>
              <Text style={styles.scheduleLabel}>Wake up time</Text>
              <Text style={styles.scheduleValue}>{settings.wakeUpTime}</Text>
            </Card>

            <Card>
              <Text style={styles.scheduleLabel}>Work hours</Text>
              <Text style={styles.scheduleValue}>
                {settings.workHours.start} - {settings.workHours.end}
              </Text>
            </Card>

            <Card>
              <Text style={styles.scheduleLabel}>Do not disturb</Text>
              <Text style={styles.scheduleValue}>
                {settings.doNotDisturb.start} - {settings.doNotDisturb.end}
              </Text>
            </Card>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>

            <Card variant="highlighted">
              <Text style={styles.dangerTitle}>Reset All Data</Text>
              <Text style={styles.dangerText}>
                This will delete all your habits, progress, and settings. This
                action cannot be undone.
              </Text>
              <Button variant="danger" onPress={handleResetApp}>
                Reset Everything
              </Button>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={addHabitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddHabitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Habit</Text>

            <Input
              placeholder="e.g., Tren 3x i uka"
              value={newHabitTitle}
              onChangeText={setNewHabitTitle}
              onSubmitEditing={handleAddHabit}
            />

            <View style={styles.modalButtons}>
              <Button
                variant="ghost"
                onPress={() => setAddHabitModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddHabit}
                disabled={!newHabitTitle.trim()}
                style={styles.modalButton}
              >
                Add
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
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitTitle: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  deleteButton: {
    fontSize: typography.fontSize.sm,
    color: colors.accent,
    fontWeight: typography.fontWeight.semibold,
  },
  optionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  personaIcon: {
    fontSize: 32,
  },
  personaInfo: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  scheduleLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scheduleValue: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  dangerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  dangerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
