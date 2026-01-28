import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Todo, Priority } from '../types';

interface TodoModalProps {
  synlig: boolean;
  onLukk: () => void;
  onLagre: (todo: Omit<Todo, 'id' | 'opprettet'>) => void;
  redigerTodo?: Todo | null;
}

const prioriteter: { key: Priority; label: string; farge: string }[] = [
  { key: 'lav', label: 'Lav', farge: '#34C759' },
  { key: 'medium', label: 'Medium', farge: '#FFCC00' },
  { key: 'høy', label: 'Høy', farge: '#FF3B30' },
];

export const TodoModal: React.FC<TodoModalProps> = ({
  synlig,
  onLukk,
  onLagre,
  redigerTodo,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tittel, setTittel] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [prioritet, setPrioritet] = useState<Priority>('medium');
  const [forfallsdato, setForfallsdato] = useState<Date | null>(null);
  const [visDatePicker, setVisDatePicker] = useState(false);

  useEffect(() => {
    if (redigerTodo) {
      setTittel(redigerTodo.tittel);
      setBeskrivelse(redigerTodo.beskrivelse);
      setPrioritet(redigerTodo.prioritet);
      setForfallsdato(
        redigerTodo.forfallsdato ? new Date(redigerTodo.forfallsdato) : null
      );
    } else {
      setTittel('');
      setBeskrivelse('');
      setPrioritet('medium');
      setForfallsdato(null);
    }
  }, [redigerTodo, synlig]);

  const håndterLagre = () => {
    if (!tittel.trim()) return;

    onLagre({
      tittel: tittel.trim(),
      beskrivelse: beskrivelse.trim(),
      prioritet,
      forfallsdato: forfallsdato?.toISOString() || null,
      ferdig: redigerTodo?.ferdig || false,
    });

    setTittel('');
    setBeskrivelse('');
    setPrioritet('medium');
    setForfallsdato(null);
    onLukk();
  };

  const håndterDatoEndring = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setVisDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForfallsdato(selectedDate);
    }
  };

  const formaterDato = (dato: Date): string => {
    return dato.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <Modal
      visible={synlig}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onLukk}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, isDark && styles.containerDark]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onLukk}>
            <Text style={styles.avbrytKnapp}>Avbryt</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTittel, isDark && styles.headerTittelDark]}>
            {redigerTodo ? 'Rediger oppgave' : 'Ny oppgave'}
          </Text>
          <TouchableOpacity onPress={håndterLagre} disabled={!tittel.trim()}>
            <Text
              style={[
                styles.lagreKnapp,
                !tittel.trim() && styles.lagreKnappDeaktivert,
              ]}
            >
              Lagre
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.innhold} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGruppe}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Tittel *
            </Text>
            <TextInput
              style={[
                styles.input,
                isDark && styles.inputDark,
                isDark && styles.inputTextDark,
              ]}
              value={tittel}
              onChangeText={setTittel}
              placeholder="Hva skal gjøres?"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoFocus
            />
          </View>

          <View style={styles.inputGruppe}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Beskrivelse (valgfri)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.tekstområde,
                isDark && styles.inputDark,
                isDark && styles.inputTextDark,
              ]}
              value={beskrivelse}
              onChangeText={setBeskrivelse}
              placeholder="Legg til detaljer..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGruppe}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Prioritet
            </Text>
            <View style={styles.prioritetContainer}>
              {prioriteter.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.prioritetKnapp,
                    isDark && styles.prioritetKnappDark,
                    prioritet === p.key && {
                      backgroundColor: p.farge + '20',
                      borderColor: p.farge,
                    },
                  ]}
                  onPress={() => setPrioritet(p.key)}
                >
                  <View
                    style={[styles.prioritetDot, { backgroundColor: p.farge }]}
                  />
                  <Text
                    style={[
                      styles.prioritetTekst,
                      isDark && styles.prioritetTekstDark,
                      prioritet === p.key && { color: p.farge },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGruppe}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Forfallsdato (valgfri)
            </Text>
            <TouchableOpacity
              style={[styles.datoKnapp, isDark && styles.datoKnappDark]}
              onPress={() => setVisDatePicker(true)}
            >
              <Text style={styles.datoIkon}>📅</Text>
              <Text
                style={[
                  styles.datoTekst,
                  isDark && styles.datoTekstDark,
                  !forfallsdato && styles.datoPlaceholder,
                ]}
              >
                {forfallsdato ? formaterDato(forfallsdato) : 'Velg dato'}
              </Text>
              {forfallsdato && (
                <TouchableOpacity
                  style={styles.fjernDatoKnapp}
                  onPress={() => setForfallsdato(null)}
                >
                  <Text style={styles.fjernDatoTekst}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {visDatePicker && (
            <DateTimePicker
              value={forfallsdato || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={håndterDatoEndring}
              minimumDate={new Date()}
              locale="nb-NO"
            />
          )}

          {Platform.OS === 'ios' && visDatePicker && (
            <TouchableOpacity
              style={styles.ferdigDatoKnapp}
              onPress={() => setVisDatePicker(false)}
            >
              <Text style={styles.ferdigDatoTekst}>Ferdig</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  containerDark: {
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTittel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  headerTittelDark: {
    color: '#ffffff',
  },
  avbrytKnapp: {
    fontSize: 17,
    color: '#007AFF',
  },
  lagreKnapp: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  lagreKnappDeaktivert: {
    opacity: 0.4,
  },
  innhold: {
    flex: 1,
    padding: 16,
  },
  inputGruppe: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelDark: {
    color: '#999',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDark: {
    backgroundColor: '#2a2a3e',
    borderColor: '#3d3d5c',
  },
  inputTextDark: {
    color: '#ffffff',
  },
  tekstområde: {
    minHeight: 100,
    paddingTop: 14,
  },
  prioritetContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  prioritetKnapp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  prioritetKnappDark: {
    backgroundColor: '#2a2a3e',
    borderColor: '#3d3d5c',
  },
  prioritetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  prioritetTekst: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  prioritetTekstDark: {
    color: '#999',
  },
  datoKnapp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datoKnappDark: {
    backgroundColor: '#2a2a3e',
    borderColor: '#3d3d5c',
  },
  datoIkon: {
    fontSize: 20,
    marginRight: 12,
  },
  datoTekst: {
    flex: 1,
    fontSize: 17,
    color: '#1a1a2e',
  },
  datoTekstDark: {
    color: '#ffffff',
  },
  datoPlaceholder: {
    color: '#999',
  },
  fjernDatoKnapp: {
    padding: 4,
  },
  fjernDatoTekst: {
    fontSize: 18,
    color: '#999',
  },
  ferdigDatoKnapp: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginTop: 8,
  },
  ferdigDatoTekst: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
