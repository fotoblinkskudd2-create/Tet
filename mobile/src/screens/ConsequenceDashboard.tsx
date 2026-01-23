import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getConsequences } from '../services/api';

export default function ConsequenceDashboard({ route, navigation }: any) {
  const { userId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const consequences = await getConsequences(userId);
      setData(consequences);
    } catch (error) {
      console.error('Failed to load consequences:', error);
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

  const formatNumber = (num: number) => {
    return num.toLocaleString('nb-NO', { maximumFractionDigits: 0 });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>The Math</Text>
        <Text style={styles.subtitle}>No pretense. Just facts.</Text>
      </View>

      {/* Current State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where You Are</Text>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Learning Hours</Text>
          <Text style={styles.statValue}>
            {data.learning_hours_total.toFixed(1)} hrs
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>
            {data.learning_hours_this_week.toFixed(1)} hrs
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Skills Acquired</Text>
          <Text style={styles.statValue}>{data.skills_acquired.length}</Text>
        </View>

        <View style={styles.skillsList}>
          {data.skills_acquired.map((skill: string, index: number) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Skill Market Value</Text>
          <Text style={styles.statValueLarge}>
            {formatNumber(data.current_skill_market_value)} kr
          </Text>
          <Text style={styles.statHelper}>Annual salary potential</Text>
        </View>

        {data.debt_amount && (
          <View style={[styles.stat, styles.debtStat]}>
            <Text style={styles.statLabel}>Total Debt</Text>
            <Text style={styles.debtValue}>
              {formatNumber(data.debt_amount)} kr
            </Text>
            {data.days_until_next_payment && (
              <Text style={styles.statHelper}>
                Next payment: {data.days_until_next_payment} days
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Projection: Continue */}
      <View style={[styles.section, styles.projectionSection]}>
        <Text style={styles.sectionTitle}>If You Continue This Pace</Text>

        <Text style={styles.projectionText}>
          {data.continue_current_path.message}
        </Text>

        {data.continue_current_path.weeks_to_job_ready && (
          <View style={styles.projectionStats}>
            <View style={styles.projectionStat}>
              <Text style={styles.projectionStatValue}>
                {data.continue_current_path.weeks_to_job_ready}
              </Text>
              <Text style={styles.projectionStatLabel}>weeks to job-ready</Text>
            </View>

            <View style={styles.projectionStat}>
              <Text style={styles.projectionStatValue}>
                {Math.round(
                  data.continue_current_path.estimated_job_probability * 100
                )}
                %
              </Text>
              <Text style={styles.projectionStatLabel}>job probability</Text>
            </View>

            {data.continue_current_path.estimated_salary > 0 && (
              <View style={styles.projectionStat}>
                <Text style={styles.projectionStatValue}>
                  {formatNumber(data.continue_current_path.estimated_salary)}
                </Text>
                <Text style={styles.projectionStatLabel}>
                  kr estimated salary
                </Text>
              </View>
            )}
          </View>
        )}

        {data.continue_current_path.debt_clear_months && (
          <View style={styles.debtClearBox}>
            <Text style={styles.debtClearText}>
              Debt clear in {data.continue_current_path.debt_clear_months}{' '}
              months
            </Text>
          </View>
        )}
      </View>

      {/* Projection: Give Up */}
      <View style={[styles.section, styles.giveUpSection]}>
        <Text style={styles.sectionTitle}>If You Give Up Now</Text>

        <Text style={styles.giveUpText}>
          {data.give_up_projection.message}
        </Text>

        <View style={styles.giveUpStats}>
          <Text style={styles.giveUpStat}>
            Job Probability: {Math.round(data.give_up_projection.job_probability * 100)}%
          </Text>
          <Text style={styles.giveUpStat}>
            Income: {formatNumber(data.give_up_projection.income_potential)} kr
          </Text>
          {data.give_up_projection.debt_status && (
            <Text style={styles.giveUpStat}>
              Debt: {data.give_up_projection.debt_status}
            </Text>
          )}
        </View>

        <Text style={styles.consequenceTimeline}>
          {data.give_up_projection.consequence_timeline}
        </Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Progress', { userId })}
        >
          <Text style={styles.navButtonText}>View Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButtonPrimary}
          onPress={() => navigation.navigate('Learning', { userId })}
        >
          <Text style={styles.navButtonPrimaryText}>Continue Learning</Text>
        </TouchableOpacity>
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
  stat: {
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  statValueLarge: {
    fontSize: 32,
    color: '#0f0',
    fontWeight: 'bold',
  },
  statHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  debtStat: {
    backgroundColor: '#1a0000',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  debtValue: {
    fontSize: 32,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
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
  projectionSection: {
    backgroundColor: '#001a00',
  },
  projectionText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    lineHeight: 24,
  },
  projectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  projectionStat: {
    flex: 1,
    alignItems: 'center',
  },
  projectionStatValue: {
    fontSize: 24,
    color: '#0f0',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectionStatLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  debtClearBox: {
    backgroundColor: '#003300',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f0',
  },
  debtClearText: {
    color: '#0f0',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  giveUpSection: {
    backgroundColor: '#1a0000',
  },
  giveUpText: {
    fontSize: 16,
    color: '#ff8888',
    marginBottom: 20,
    lineHeight: 24,
  },
  giveUpStats: {
    marginBottom: 20,
  },
  giveUpStat: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 10,
  },
  consequenceTimeline: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  navigation: {
    padding: 20,
  },
  navButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  navButtonPrimary: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonPrimaryText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
