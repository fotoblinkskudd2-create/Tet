import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const STORAGE_KEY = '@necessary-evil-store';

// Helper to calculate completion rate
const calculateCompletionRate = (habits, dateStr) => {
  const habitsForDate = habits.filter(h =>
    h.completions.some(c => c.date === dateStr)
  );

  if (habitsForDate.length === 0) return 0;

  const completed = habitsForDate.filter(h =>
    h.completions.find(c => c.date === dateStr)?.completed
  ).length;

  return completed / habitsForDate.length;
};

const initialState = {
  // User settings
  user: {
    id: null,
    email: null,
    nickname: null,
    onboarded: false,
  },

  // App settings
  settings: {
    roastLevel: 'normal', // soft, normal, brutal
    persona: 'coldCeo',
    wakeUpTime: '07:00',
    workHours: { start: '09:00', end: '17:00' },
    doNotDisturb: { start: '22:00', end: '07:00' },
    notificationsEnabled: true,
    leaderboardOptIn: false,
  },

  // Habits
  habits: [],
  // Example habit structure:
  // {
  //   id: '1',
  //   title: 'Tren 3x i uka',
  //   frequency: 3, // times per week
  //   completions: [
  //     { date: '2025-12-07', completed: true, note: '' },
  //   ],
  //   createdAt: '2025-12-07',
  // }

  // Stats
  stats: {
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalFailures: 0,
    weeklyCompletion: 0,
    monthlyCompletion: 0,
  },

  // Panic mode
  panicMode: {
    active: false,
    startTime: null,
    duration: 30, // minutes
    task: null,
  },

  // Leaderboard (mock data for now)
  leaderboard: [],
};

export const useStore = create((set, get) => ({
  ...initialState,

  // Load persisted state
  loadState: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set(parsed);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  },

  // Save state to storage
  saveState: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },

  // User actions
  setUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
    get().saveState();
  },

  completeOnboarding: (data) => {
    set({
      user: { ...get().user, onboarded: true },
      settings: { ...get().settings, ...data.settings },
      habits: data.habits,
    });
    get().saveState();
  },

  // Settings actions
  updateSettings: (newSettings) => {
    set({ settings: { ...get().settings, ...newSettings } });
    get().saveState();
  },

  // Habit actions
  addHabit: (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      ...habit,
      completions: [],
      createdAt: new Date().toISOString(),
    };
    set({ habits: [...get().habits, newHabit] });
    get().saveState();
  },

  updateHabit: (habitId, updates) => {
    set({
      habits: get().habits.map((h) =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    });
    get().saveState();
  },

  deleteHabit: (habitId) => {
    set({ habits: get().habits.filter((h) => h.id !== habitId) });
    get().saveState();
  },

  toggleHabitCompletion: (habitId, date = format(new Date(), 'yyyy-MM-dd'), note = '') => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const existingCompletion = habit.completions.find((c) => c.date === date);

    let updatedCompletions;
    if (existingCompletion) {
      // Toggle existing completion
      updatedCompletions = habit.completions.map((c) =>
        c.date === date ? { ...c, completed: !c.completed, note } : c
      );
    } else {
      // Add new completion
      updatedCompletions = [
        ...habit.completions,
        { date, completed: true, note },
      ];
    }

    get().updateHabit(habitId, { completions: updatedCompletions });
    get().updateStats();
  },

  snoozeHabit: (habitId) => {
    // Could add snooze tracking here
    console.log('Habit snoozed:', habitId);
  },

  // Stats actions
  updateStats: () => {
    const { habits } = get();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate total completions and failures
    let totalCompletions = 0;
    let totalFailures = 0;

    habits.forEach((habit) => {
      habit.completions.forEach((completion) => {
        if (completion.completed) {
          totalCompletions++;
        } else {
          totalFailures++;
        }
      });
    });

    // Calculate weekly completion
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const weeklyCompletions = habits.flatMap(h =>
      h.completions.filter(c => {
        const compDate = new Date(c.date);
        return isWithinInterval(compDate, { start: weekStart, end: weekEnd }) && c.completed;
      })
    ).length;

    const weeklyTotal = habits.length * 7; // Max possible completions
    const weeklyCompletion = weeklyTotal > 0 ? weeklyCompletions / weeklyTotal : 0;

    set({
      stats: {
        currentStreak,
        longestStreak,
        totalCompletions,
        totalFailures,
        weeklyCompletion,
        monthlyCompletion: 0, // Calculate monthly later
      },
    });

    get().saveState();
  },

  getTodayCompletionRate: () => {
    const { habits } = get();
    const today = format(new Date(), 'yyyy-MM-dd');

    if (habits.length === 0) return 0;

    const completedToday = habits.filter(h => {
      const todayCompletion = h.completions.find(c => c.date === today);
      return todayCompletion?.completed;
    }).length;

    return completedToday / habits.length;
  },

  // Panic mode actions
  startPanicMode: (task, duration = 30) => {
    set({
      panicMode: {
        active: true,
        startTime: new Date().toISOString(),
        duration,
        task,
      },
    });
    get().saveState();
  },

  endPanicMode: (success = false) => {
    const { panicMode } = get();

    set({
      panicMode: {
        ...panicMode,
        active: false,
      },
    });

    get().saveState();
    return success;
  },

  // Leaderboard actions
  updateLeaderboard: (data) => {
    set({ leaderboard: data });
  },

  joinLeaderboard: (nickname) => {
    set({
      user: { ...get().user, nickname },
      settings: { ...get().settings, leaderboardOptIn: true },
    });
    get().saveState();
  },

  leaveLeaderboard: () => {
    set({
      settings: { ...get().settings, leaderboardOptIn: false },
    });
    get().saveState();
  },

  // Reset app (for testing/development)
  resetApp: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set(initialState);
  },
}));

export default useStore;
