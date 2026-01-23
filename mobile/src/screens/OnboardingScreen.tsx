import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { onboardUser } from '../services/api';

export default function OnboardingScreen({ navigation }: any) {
  const [chaosLevel, setChaosLevel] = useState(50);
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [situation, setSituation] = useState('');
  const [hasDID, setHasDID] = useState(false);
  const [debtAmount, setDebtAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!primaryGoal.trim() || !situation.trim()) {
      Alert.alert('Missing Info', 'Fill in goal and situation.');
      return;
    }

    setLoading(true);
    try {
      const response = await onboardUser({
        chaos_level: chaosLevel,
        primary_goal: primaryGoal,
        current_situation: situation,
        has_did: hasDID,
        debt_amount: debtAmount ? parseFloat(debtAmount) : undefined,
      });

      // Show assessment
      Alert.alert(
        'Assessment',
        `${response.initial_assessment}\n\n${response.recommended_path}`,
        [
          {
            text: 'Start Learning',
            onPress: () =>
              navigation.replace('Learning', { userId: response.user_id }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fracture</Text>
        <Text style={styles.subtitle}>No pretense. Just learning.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>How fucked are you right now?</Text>
        <Text style={styles.helperText}>0 = functioning, 100 = collapsing</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{chaosLevel}</Text>
          <TextInput
            style={styles.sliderInput}
            keyboardType="number-pad"
            value={chaosLevel.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              setChaosLevel(Math.max(0, Math.min(100, num)));
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>What do you need to learn?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Web development, Python, get a job"
          placeholderTextColor="#666"
          value={primaryGoal}
          onChangeText={setPrimaryGoal}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current situation</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What's happening in your life right now?"
          placeholderTextColor="#666"
          value={situation}
          onChangeText={setSituation}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setHasDID(!hasDID)}
        >
          <View style={[styles.checkboxBox, hasDID && styles.checkboxChecked]}>
            {hasDID && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have DID or dissociative issues
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Total debt (optional, NOK)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 250000"
          placeholderTextColor="#666"
          keyboardType="number-pad"
          value={debtAmount}
          onChangeText={setDebtAmount}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Begin'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        The app will assess your situation and create a learning path.{'\n'}
        No bullshit. No motivation. Just what you need to do.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 20,
    minWidth: 60,
  },
  sliderInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkboxMark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
});
