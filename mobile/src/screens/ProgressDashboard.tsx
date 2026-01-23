import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getProgress } from '../services/api';

export default function ProgressDashboard({ route }: any) {
  const { userId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const progress = await getProgress(userId);
      setData(progress);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load data</Text>
      </View>
    );
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>What's been done. No celebration.</Text>
      </View>

      {/* Overview Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.days_active}</Text>
            <Text style={styles.statLabel}>days active</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.total_sessions}</Text>
            <Text style={styles.statLabel}>sessions</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {formatMinutes(data.total_learning_minutes)}
            </Text>
            <Text style={styles.statLabel}>total time</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.modules_completed}</Text>
            <Text style={styles.statLabel}>completed</Text>
          </View>
        </View>

        {data.current_streak_days > 0 && (
          <View style={styles.streakBox}>
            <Text style={styles.streakValue}>{data.current_streak_days}</Text>
            <Text style={styles.streakLabel}>day streak (not bragging, just fact)</Text>
          </View>
        )}
      </View>

      {/* Skills by Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills Acquired</Text>

        {Object.entries(data.skills_by_category).map(([category, skills]: [string, any]) => (
          <View key={category} style={styles.categoryBlock}>
            <Text style={styles.categoryName}>{category}</Text>
            <View style={styles.skillsList}>
              {skills.map((skill: string, index: number) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {Object.keys(data.skills_by_category).length === 0 && (
          <Text style={styles.emptyText}>No skills yet. Start learning.</Text>
        )}
      </View>

      {/* Mental State Patterns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavioral Patterns</Text>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Average Cognitive Load</Text>
          <Text style={styles.statValue}>
            {Math.round(data.average_cognitive_load)}/100
          </Text>
          <Text style={styles.statHelper}>
            {data.average_cognitive_load > 70
              ? 'Usually overwhelmed. Consider shorter sessions.'
              : data.average_cognitive_load > 40
              ? 'Moderate load. Manageable.'
              : 'Low load. Good learning capacity.'}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Best Learning Times</Text>
          {data.optimal_learning_windows.map((window: string, index: number) => (
            <Text key={index} style={styles.windowText}>
              • {window}
            </Text>
          ))}
          {data.optimal_learning_windows.length === 0 && (
            <Text style={styles.emptyText}>Not enough data yet</Text>
          )}
        </View>

        {data.detected_parts && data.detected_parts.length > 0 && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Detected Parts (DID)</Text>
            {data.detected_parts.map((part: string, index: number) => (
              <Text key={index} style={styles.partText}>
                • {part}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  statBox: {
    width: '50%',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  streakBox: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    color: '#888',
  },
  categoryBlock: {
    marginBottom: 25,
  },
  categoryName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  skillText: {
    color: '#fff',
    fontSize: 14,
  },
  stat: {
    marginBottom: 25,
  },
  statHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  windowText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
    marginLeft: 10,
  },
  partText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
