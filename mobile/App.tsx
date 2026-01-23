import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import LearningScreen from './src/screens/LearningScreen';
import ConsequenceDashboard from './src/screens/ConsequenceDashboard';
import ProgressDashboard from './src/screens/ProgressDashboard';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ title: 'Fracture', headerShown: false }}
          />
          <Stack.Screen
            name="Learning"
            component={LearningScreen}
            options={{ title: 'Learn' }}
          />
          <Stack.Screen
            name="Consequences"
            component={ConsequenceDashboard}
            options={{ title: 'The Math' }}
          />
          <Stack.Screen
            name="Progress"
            component={ProgressDashboard}
            options={{ title: 'Progress' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
