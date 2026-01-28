import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTodos } from './src/hooks/useTodos';
import { TodoItem } from './src/components/TodoItem';
import { TodoModal } from './src/components/TodoModal';
import { FilterBar } from './src/components/FilterBar';
import { Todo } from './src/types';

const formaterDagensData = (): string => {
  const idag = new Date();
  return idag.toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    todos,
    alleTodos,
    filter,
    setFilter,
    laster,
    oppdaterer,
    oppdaterTodos,
    leggTilTodo,
    oppdaterTodo,
    slettTodo,
    byttFerdigStatus,
  } = useTodos();

  const [modalSynlig, setModalSynlig] = useState(false);
  const [redigerTodo, setRedigerTodo] = useState<Todo | null>(null);

  const håndterNyTodo = () => {
    setRedigerTodo(null);
    setModalSynlig(true);
  };

  const håndterRediger = (todo: Todo) => {
    setRedigerTodo(todo);
    setModalSynlig(true);
  };

  const håndterLagre = (todoData: Omit<Todo, 'id' | 'opprettet'>) => {
    if (redigerTodo) {
      oppdaterTodo(redigerTodo.id, todoData);
    } else {
      leggTilTodo(todoData);
    }
  };

  const antallUferdige = alleTodos.filter((t) => !t.ferdig).length;
  const antallFerdige = alleTodos.filter((t) => t.ferdig).length;

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#1a1a2e' : '#f5f5f7'}
        />

        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View>
            <Text style={[styles.appNavn, isDark && styles.appNavnDark]}>
              Bergen Todo
            </Text>
            <Text style={[styles.dato, isDark && styles.datoDark]}>
              {formaterDagensData()}
            </Text>
          </View>
          <View style={styles.statistikk}>
            <View style={styles.statistikkItem}>
              <Text style={styles.statistikkTall}>{antallUferdige}</Text>
              <Text style={[styles.statistikkLabel, isDark && styles.statistikkLabelDark]}>
                Gjenstår
              </Text>
            </View>
            <View style={styles.statistikkDivider} />
            <View style={styles.statistikkItem}>
              <Text style={[styles.statistikkTall, styles.statistikkTallFerdig]}>
                {antallFerdige}
              </Text>
              <Text style={[styles.statistikkLabel, isDark && styles.statistikkLabelDark]}>
                Ferdig
              </Text>
            </View>
          </View>
        </View>

        {/* Filter */}
        <FilterBar aktivFilter={filter} onFilterEndring={setFilter} />

        {/* Todo Liste */}
        {laster ? (
          <View style={styles.lasterContainer}>
            <Text style={[styles.lasterTekst, isDark && styles.lasterTekstDark]}>
              Laster oppgaver...
            </Text>
          </View>
        ) : todos.length === 0 ? (
          <View style={styles.tomContainer}>
            <Text style={styles.tomEmoji}>📝</Text>
            <Text style={[styles.tomTittel, isDark && styles.tomTittelDark]}>
              {filter === 'alle'
                ? 'Ingen oppgaver ennå'
                : filter === 'ferdige'
                ? 'Ingen ferdige oppgaver'
                : 'Alle oppgaver er fullført!'}
            </Text>
            <Text style={[styles.tomBeskrivelse, isDark && styles.tomBeskrivelseDark]}>
              {filter === 'alle'
                ? 'Trykk på + knappen for å legge til din første oppgave'
                : 'Endre filter for å se andre oppgaver'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onToggle={() => byttFerdigStatus(item.id)}
                onEdit={() => håndterRediger(item)}
                onDelete={() => slettTodo(item.id)}
              />
            )}
            contentContainerStyle={styles.listeInnhold}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={oppdaterer}
                onRefresh={oppdaterTodos}
                tintColor={isDark ? '#ffffff' : '#007AFF'}
                colors={['#007AFF']}
              />
            }
          />
        )}

        {/* Legg til knapp */}
        <TouchableOpacity
          style={styles.leggTilKnapp}
          onPress={håndterNyTodo}
          activeOpacity={0.8}
        >
          <Text style={styles.leggTilTekst}>+</Text>
        </TouchableOpacity>

        {/* Modal */}
        <TodoModal
          synlig={modalSynlig}
          onLukk={() => setModalSynlig(false)}
          onLagre={håndterLagre}
          redigerTodo={redigerTodo}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  headerDark: {
    backgroundColor: '#2a2a3e',
  },
  appNavn: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  appNavnDark: {
    color: '#ffffff',
  },
  dato: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  datoDark: {
    color: '#999',
  },
  statistikk: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statistikkItem: {
    alignItems: 'center',
  },
  statistikkTall: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statistikkTallFerdig: {
    color: '#34C759',
  },
  statistikkLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statistikkLabelDark: {
    color: '#999',
  },
  statistikkDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  listeInnhold: {
    paddingBottom: 100,
  },
  lasterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lasterTekst: {
    fontSize: 16,
    color: '#666',
  },
  lasterTekstDark: {
    color: '#999',
  },
  tomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  tomEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  tomTittel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  tomTittelDark: {
    color: '#ffffff',
  },
  tomBeskrivelse: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tomBeskrivelseDark: {
    color: '#999',
  },
  leggTilKnapp: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  leggTilTekst: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
});
