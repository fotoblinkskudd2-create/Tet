import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'
import { useAuth } from '../../lib/auth'

export default function TabsLayout() {
  const { user } = useAuth()

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#2a2a2a',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#ff2323',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#0a0a0a',
          borderBottomColor: '#2a2a2a',
          borderBottomWidth: 1,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#ff2323', fontFamily: 'Inter-Black', fontSize: 18 }}>RØD</Text>
              <Text style={{ color: '#fff', fontFamily: 'Inter-Black', fontSize: 18 }}>PILLE</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          title: 'Trending',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                backgroundColor: '#ff2323',
                borderRadius: 8,
                padding: 8,
                marginBottom: 4,
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault()
              // Navigate to login
            }
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Varsler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: 3, // TODO: Real notification count
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
