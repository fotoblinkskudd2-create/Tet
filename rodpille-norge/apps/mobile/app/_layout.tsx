import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from '../lib/auth'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View } from 'react-native'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-Black': require('../assets/fonts/Inter-Black.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#0a0a0a',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontFamily: 'Inter-Bold',
                },
                contentStyle: {
                  backgroundColor: '#0a0a0a',
                },
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="post/[id]"
                options={{
                  title: 'Innlegg',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="user/[username]"
                options={{
                  title: 'Profil',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="(auth)/login"
                options={{
                  title: 'Logg inn',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="(auth)/signup"
                options={{
                  title: 'Registrer',
                  presentation: 'modal',
                }}
              />
            </Stack>
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
