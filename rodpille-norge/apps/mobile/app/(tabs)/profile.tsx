import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../lib/auth'

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuth()

  if (!user) {
    return (
      <View style={styles.authPrompt}>
        <View style={styles.authIcon}>
          <Ionicons name="person" size={48} color="#ff2323" />
        </View>
        <Text style={styles.authTitle}>Bli en del av bevegelsen</Text>
        <Text style={styles.authSubtitle}>
          Logg inn for å poste, stemme og delta i debatten.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>LOGG INN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={styles.secondaryButtonText}>REGISTRER DEG</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar_url ? (
            <View style={styles.avatar}>
              {/* Image would go here */}
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#ff2323" />
            </View>
          )}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.role}>
          {user.role === 'admin'
            ? 'Administrator'
            : user.role === 'moderator'
            ? 'Moderator'
            : user.role === 'rod_pille'
            ? 'Rød Pille'
            : 'Normie'}
        </Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.red_pill_score}</Text>
          <Text style={styles.statLabel}>Rød Pille Score</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.lies_exposed_count}</Text>
          <Text style={styles.statLabel}>Løgner Avslørt</Text>
        </View>
      </View>

      {/* Subscription Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABONNEMENT</Text>
        <View style={styles.subscriptionCard}>
          {user.subscription_tier === 'elite' ? (
            <>
              <View style={styles.eliteBadge}>
                <Ionicons name="star" size={16} color="#fff" />
                <Text style={styles.eliteBadgeText}>RØD PILLE ELITE</Text>
              </View>
              <Text style={styles.subscriptionText}>
                Du har tilgang til alle premium-funksjoner
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.subscriptionText}>
                Oppgrader til Elite for ad-free, prioritet i feed og
                eksklusive AI-rapporter.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/subscribe')}
              >
                <Text style={styles.upgradeButtonText}>
                  OPPGRADER - 99 kr/mnd
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INNSTILLINGER</Text>
        <View style={styles.menu}>
          <MenuItem
            icon="create-outline"
            label="Rediger profil"
            onPress={() => router.push('/settings/profile')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Varsler"
            onPress={() => router.push('/settings/notifications')}
          />
          <MenuItem
            icon="shield-outline"
            label="Personvern"
            onPress={() => router.push('/settings/privacy')}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Hjelp & FAQ"
            onPress={() => router.push('/help')}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await signOut()
          router.replace('/')
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#ff2323" />
        <Text style={styles.logoutButtonText}>Logg ut</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>RødPilleNorge v1.0.0</Text>
        <Text style={styles.footerText}>Sannheten frigjør</Text>
      </View>
    </ScrollView>
  )
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string
  label: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={20} color="#fff" />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  authPrompt: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4b0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authTitle: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginBottom: 8,
  },
  authSubtitle: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#ff2323',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#ff2323',
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ff2323',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4b0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginBottom: 4,
  },
  role: {
    color: '#ff2323',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  bio: {
    color: '#888',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#ff2323',
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  statLabel: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#666',
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    marginBottom: 12,
    letterSpacing: 1,
  },
  subscriptionCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eliteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff2323',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  eliteBadgeText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  subscriptionText: {
    color: '#888',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#ff2323',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  menu: {
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ff2323',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ff2323',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    color: '#444',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
})
