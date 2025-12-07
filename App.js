import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import notificationService from './src/services/notificationService';
import { colors } from './src/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const loadState = useStore((state) => state.loadState);
  const updateStats = useStore((state) => state.updateStats);
  const isOnboarded = useStore((state) => state.user.onboarded);
  const settings = useStore((state) => state.settings);

  useEffect(() => {
    async function prepare() {
      try {
        // Load persisted state
        await loadState();

        // Initialize notifications
        await notificationService.initialize();

        // Update stats
        updateStats();

        // Small delay for splash screen effect
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady && isOnboarded) {
      // Schedule notifications based on user settings
      notificationService.scheduleHabitReminders(settings);
    }
  }, [isReady, isOnboarded, settings]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppNavigator isOnboarded={isOnboarded} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
