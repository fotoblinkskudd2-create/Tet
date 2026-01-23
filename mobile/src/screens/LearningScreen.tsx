import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  startSession,
  getNextModule,
  completeSession,
  getCurrentState,
} from '../services/api';

export default function LearningScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interventionMessage, setInterventionMessage] = useState<string | null>(
    null
  );
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      // Start session
      const session = await startSession({ user_id: userId });
      setSessionId(session.session_id);

      // Get next module
      const module = await getNextModule(session.session_id);
      setCurrentModule(module);

      // Check mental state
      const state = await getCurrentState(userId);
      if (!state.learning_window_optimal) {
        setInterventionMessage(state.recommendation);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start learning session.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    try {
      const response = await completeSession({
        session_id: sessionId,
        completion_rate: completionRate,
      });

      Alert.alert(
        'Session Complete',
        `${response.message}\n\n${response.next_session_recommendation}`,
        [
          {
            text: 'View Consequences',
            onPress: () => navigation.navigate('Consequences', { userId }),
          },
          {
            text: 'Continue Learning',
            onPress: () => {
              setLoading(true);
              initSession();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete session.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Selecting module...</Text>
      </View>
    );
  }

  if (!currentModule) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No module available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {interventionMessage && (
        <View style={styles.intervention}>
          <Text style={styles.interventionText}>{interventionMessage}</Text>
          <TouchableOpacity
            onPress={() => setInterventionMessage(null)}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissText}>Continue Anyway</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.directive}>{currentModule.message}</Text>
        <Text style={styles.category}>{currentModule.skill_category}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.moduleTitle}>
          {currentModule.content_data.title}
        </Text>
        <Text style={styles.intro}>{currentModule.content_data.intro}</Text>

        {currentModule.content_data.concepts &&
          currentModule.content_data.concepts.map(
            (concept: any, index: number) => (
              <View key={index} style={styles.concept}>
                <Text style={styles.conceptName}>
                  {concept.name || `Concept ${index + 1}`}
                </Text>
                {concept.code && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.code}>{concept.code}</Text>
                  </View>
                )}
                {concept.explanation && (
                  <Text style={styles.explanation}>{concept.explanation}</Text>
                )}
              </View>
            )
          )}

        {currentModule.content_data.practice && (
          <View style={styles.practice}>
            <Text style={styles.practiceTitle}>Practice</Text>
            <Text style={styles.practiceInstruction}>
              {currentModule.content_data.practice.instruction}
            </Text>
            <TouchableOpacity
              style={styles.showSolutionButton}
              onPress={() =>
                Alert.alert(
                  'Solution',
                  currentModule.content_data.practice.solution
                )
              }
            >
              <Text style={styles.showSolutionText}>Show Solution</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.completionLabel}>Completion Rate</Text>
        <View style={styles.rateButtons}>
          {[0.3, 0.6, 0.9, 1.0].map((rate) => (
            <TouchableOpacity
              key={rate}
              style={[
                styles.rateButton,
                completionRate === rate && styles.rateButtonActive,
              ]}
              onPress={() => setCompletionRate(rate)}
            >
              <Text
                style={[
                  styles.rateButtonText,
                  completionRate === rate && styles.rateButtonTextActive,
                ]}
              >
                {Math.round(rate * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            completionRate === 0 && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={completionRate === 0}
        >
          <Text style={styles.completeButtonText}>Complete Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('Consequences', { userId })}
        >
          <Text style={styles.dashboardButtonText}>View Consequences</Text>
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
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  intervention: {
    backgroundColor: '#ff4444',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  interventionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  dismissButton: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  dismissText: {
    color: '#fff',
    fontSize: 14,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  directive: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 14,
    color: '#888',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  moduleTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  intro: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
    lineHeight: 24,
  },
  concept: {
    marginBottom: 30,
  },
  conceptName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
  },
  codeBlock: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  code: {
    fontFamily: 'monospace',
    color: '#0f0',
    fontSize: 14,
  },
  explanation: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  practice: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
  },
  practiceTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  practiceInstruction: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 15,
    lineHeight: 20,
  },
  showSolutionButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  showSolutionText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  completionLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    fontWeight: '600',
  },
  rateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rateButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  rateButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rateButtonTextActive: {
    color: '#000',
  },
  completeButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  completeButtonDisabled: {
    backgroundColor: '#333',
  },
  completeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dashboardButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
