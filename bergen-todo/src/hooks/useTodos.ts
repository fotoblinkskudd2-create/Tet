import { useState, useEffect, useCallback } from 'react';
import { Todo, FilterType } from '../types';
import { lagreTodos, hentTodos } from '../utils/storage';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('alle');
  const [laster, setLaster] = useState(true);
  const [oppdaterer, setOppdaterer] = useState(false);

  const lastTodos = useCallback(async () => {
    setLaster(true);
    const lagredeTodos = await hentTodos();
    setTodos(lagredeTodos);
    setLaster(false);
  }, []);

  const oppdaterTodos = useCallback(async () => {
    setOppdaterer(true);
    await lastTodos();
    setOppdaterer(false);
  }, [lastTodos]);

  useEffect(() => {
    lastTodos();
  }, [lastTodos]);

  useEffect(() => {
    if (!laster) {
      lagreTodos(todos);
    }
  }, [todos, laster]);

  const leggTilTodo = useCallback((nyTodo: Omit<Todo, 'id' | 'opprettet'>) => {
    const todo: Todo = {
      ...nyTodo,
      id: Date.now().toString(),
      opprettet: new Date().toISOString(),
    };
    setTodos((prev) => [todo, ...prev]);
  }, []);

  const oppdaterTodo = useCallback((id: string, oppdatering: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...oppdatering } : todo))
    );
  }, []);

  const slettTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const byttFerdigStatus = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, ferdig: !todo.ferdig } : todo
      )
    );
  }, []);

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'ferdige') return todo.ferdig;
    if (filter === 'uferdige') return !todo.ferdig;
    return true;
  });

  return {
    todos: filteredTodos,
    alleTodos: todos,
    filter,
    setFilter,
    laster,
    oppdaterer,
    oppdaterTodos,
    leggTilTodo,
    oppdaterTodo,
    slettTodo,
    byttFerdigStatus,
  };
};
