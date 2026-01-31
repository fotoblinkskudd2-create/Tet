import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function TrendingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={48} color="#ff2323" />
        <Text style={styles.title}>TRENDING</Text>
        <Text style={styles.subtitle}>De mest diskuterte sakene akkurat nå</Text>
      </View>

      {/* Placeholder - would load trending posts */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>Kommer snart</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    color: '#fff',
    fontFamily: 'Inter-Black',
    fontSize: 24,
    marginTop: 16,
  },
  subtitle: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    color: '#444',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
})
