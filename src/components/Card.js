import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, styles[variant], style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  default: {
    borderWidth: 1,
    borderColor: colors.gray800,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  success: {
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },
});

export default Card;
