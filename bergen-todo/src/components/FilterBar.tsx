import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { FilterType } from '../types';

interface FilterBarProps {
  aktivFilter: FilterType;
  onFilterEndring: (filter: FilterType) => void;
}

const filtre: { key: FilterType; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'uferdige', label: 'Uferdige' },
  { key: 'ferdige', label: 'Ferdige' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  aktivFilter,
  onFilterEndring,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {filtre.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterKnapp,
            aktivFilter === filter.key && styles.filterKnappAktiv,
            aktivFilter === filter.key && isDark && styles.filterKnappAktivDark,
          ]}
          onPress={() => onFilterEndring(filter.key)}
        >
          <Text
            style={[
              styles.filterTekst,
              isDark && styles.filterTekstDark,
              aktivFilter === filter.key && styles.filterTekstAktiv,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  containerDark: {
    backgroundColor: '#2a2a3e',
  },
  filterKnapp: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterKnappAktiv: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterKnappAktivDark: {
    backgroundColor: '#3d3d5c',
  },
  filterTekst: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTekstDark: {
    color: '#999',
  },
  filterTekstAktiv: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
