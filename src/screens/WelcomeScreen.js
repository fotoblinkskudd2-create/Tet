import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '../components';
import { colors, typography, spacing } from '../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Necessary Evil</Text>
          <Text style={styles.tagline}>
            The app that bullies you into getting your shit together.
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featureText}>✓ Brutal habit tracking</Text>
          <Text style={styles.featureText}>✓ Hard-truth productivity coaching</Text>
          <Text style={styles.featureText}>✓ Social shame leaderboards</Text>
          <Text style={styles.featureText}>✓ Dark humor gamification</Text>
        </View>

        <View style={styles.footer}>
          <Button
            onPress={() => navigation.navigate('Onboarding')}
            size="large"
          >
            Get Started
          </Button>
          <Text style={styles.disclaimer}>
            Warning: This app will not be nice to you.
          </Text>
        </View>
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
    justifyContent: 'space-between',
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
  },
  features: {
    gap: spacing.md,
  },
  featureText: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    gap: spacing.md,
  },
  disclaimer: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
