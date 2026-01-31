import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../lib/auth'
import { router } from 'expo-router'

// Mock notifications - would come from API
const mockNotifications = [
  {
    id: '1',
    type: 'reply',
    title: 'Ny kommentar',
    body: '@bruker123 svarte på innlegget ditt',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'factcheck',
    title: 'Faktasjekk ferdig',
    body: 'Løgn-score: 82/100 - Høy sannsynlighet for villedende innhold',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'trending',
    title: 'Innlegget ditt trender!',
    body: 'Ditt innlegg om strømpriser har 150+ upvotes',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export default function NotificationsScreen() {
  const { user } = useAuth()

  if (!user) {
    return (
      <View style={styles.authPrompt}>
        <Ionicons name="notifications-off" size={64} color="#666" />
        <Text style={styles.authTitle}>Logg inn for varsler</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.authButtonText}>Logg inn</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reply':
        return 'chatbubble'
      case 'factcheck':
        return 'alert-circle'
      case 'trending':
        return 'flame'
      case 'upvote':
        return 'arrow-up'
      default:
        return 'notifications'
    }
  }

  const renderNotification = ({ item }: { item: typeof mockNotifications[0] }) => (
    <TouchableOpacity
      style={[styles.notification, !item.read && styles.notificationUnread]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.type === 'factcheck' ? '#4b0000' : '#1a1a1a' },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={20}
          color={item.type === 'factcheck' ? '#ff2323' : '#fff'}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString('nb-NO')}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={mockNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>Ingen varsler ennå</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  listContent: {
    padding: 12,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  notificationUnread: {
    borderColor: '#ff2323',
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginBottom: 4,
  },
  notificationBody: {
    color: '#888',
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    color: '#555',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff2323',
    marginLeft: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    color: '#666',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
  },
  authPrompt: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#ff2323',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
})
