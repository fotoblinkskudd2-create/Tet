import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types';

const TODOS_KEY = '@bergen_todo_tasks';

export const lagreTodos = async (todos: Todo[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Feil ved lagring av todos:', error);
  }
};

export const hentTodos = async (): Promise<Todo[]> => {
  try {
    const data = await AsyncStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Feil ved henting av todos:', error);
    return [];
  }
};
