import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';
import { Todo, Priority } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const prioritetFarger: Record<Priority, string> = {
  lav: '#34C759',
  medium: '#FFCC00',
  høy: '#FF3B30',
};

const prioritetLabels: Record<Priority, string> = {
  lav: 'Lav',
  medium: 'Medium',
  høy: 'Høy',
};

const formaterDato = (datoString: string | null): string => {
  if (!datoString) return '';
  const dato = new Date(datoString);
  return dato.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  });
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderVenstreAksjon = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.venstreAksjon}>
        <Animated.View style={[styles.aksjonInnhold, { transform: [{ scale }] }]}>
          <Text style={styles.aksjonTekst}>✏️</Text>
          <Text style={styles.aksjonLabel}>Rediger</Text>
        </Animated.View>
      </View>
    );
  };

  const renderHøyreAksjon = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.høyreAksjon}>
        <Animated.View style={[styles.aksjonInnhold, { transform: [{ scale }] }]}>
          <Text style={styles.aksjonTekst}>🗑️</Text>
          <Text style={styles.aksjonLabel}>Slett</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderVenstreAksjon}
      renderRightActions={renderHøyreAksjon}
      onSwipeableLeftOpen={onEdit}
      onSwipeableRightOpen={onDelete}
      leftThreshold={80}
      rightThreshold={80}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            todo.ferdig && styles.checkboxFerdig,
            { borderColor: prioritetFarger[todo.prioritet] },
          ]}
          onPress={onToggle}
        >
          {todo.ferdig && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.innhold}>
          <View style={styles.headerRad}>
            <Text
              style={[
                styles.tittel,
                isDark && styles.tittelDark,
                todo.ferdig && styles.tittelFerdig,
              ]}
              numberOfLines={1}
            >
              {todo.tittel}
            </Text>
            <View
              style={[
                styles.prioritetBadge,
                { backgroundColor: prioritetFarger[todo.prioritet] + '20' },
              ]}
            >
              <View
                style={[
                  styles.prioritetDot,
                  { backgroundColor: prioritetFarger[todo.prioritet] },
                ]}
              />
              <Text
                style={[
                  styles.prioritetTekst,
                  { color: prioritetFarger[todo.prioritet] },
                ]}
              >
                {prioritetLabels[todo.prioritet]}
              </Text>
            </View>
          </View>

          {todo.beskrivelse ? (
            <Text
              style={[
                styles.beskrivelse,
                isDark && styles.beskrivelseDark,
                todo.ferdig && styles.beskrivelseFerdig,
              ]}
              numberOfLines={2}
            >
              {todo.beskrivelse}
            </Text>
          ) : null}

          {todo.forfallsdato && (
            <View style={styles.datoContainer}>
              <Text style={styles.datoIkon}>📅</Text>
              <Text
                style={[
                  styles.datoTekst,
                  isDark && styles.datoTekstDark,
                ]}
              >
                {formaterDato(todo.forfallsdato)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerDark: {
    backgroundColor: '#2a2a3e',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxFerdig: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  innhold: {
    flex: 1,
  },
  headerRad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tittel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 8,
  },
  tittelDark: {
    color: '#ffffff',
  },
  tittelFerdig: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  prioritetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prioritetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  prioritetTekst: {
    fontSize: 12,
    fontWeight: '600',
  },
  beskrivelse: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  beskrivelseDark: {
    color: '#999',
  },
  beskrivelseFerdig: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  datoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  datoIkon: {
    fontSize: 12,
    marginRight: 6,
  },
  datoTekst: {
    fontSize: 13,
    color: '#888',
  },
  datoTekstDark: {
    color: '#777',
  },
  venstreAksjon: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingRight: 20,
    width: 100,
  },
  høyreAksjon: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 6,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingLeft: 20,
    width: 100,
  },
  aksjonInnhold: {
    alignItems: 'center',
  },
  aksjonTekst: {
    fontSize: 24,
  },
  aksjonLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
