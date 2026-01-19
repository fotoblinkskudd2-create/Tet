import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  subscriptionTier: 'free' | 'premium' | 'eternal';
  subscriptionExpiresAt: string | null;
}

interface DeceasedPerson {
  id: string;
  name: string;
  nickname?: string | null;
  relationship?: string | null;
  profilePhotoUrl?: string | null;
  personalitySummary?: string | null;
  lastInteractionAt?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

interface DeceasedState {
  persons: DeceasedPerson[];
  currentPerson: DeceasedPerson | null;
  setPersons: (persons: DeceasedPerson[]) => void;
  setCurrentPerson: (person: DeceasedPerson | null) => void;
  addPerson: (person: DeceasedPerson) => void;
  updatePerson: (id: string, updates: Partial<DeceasedPerson>) => void;
  removePerson: (id: string) => void;
}

interface ChatState {
  conversationId: string | null;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    emotion?: string;
    createdAt: string;
  }>;
  isStreaming: boolean;
  setConversationId: (id: string | null) => void;
  addMessage: (message: any) => void;
  setMessages: (messages: any[]) => void;
  clearMessages: () => void;
  setIsStreaming: (streaming: boolean) => void;
}

// Auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'graveai-auth',
    }
  )
);

// Deceased persons store
export const useDeceasedStore = create<DeceasedState>((set) => ({
  persons: [],
  currentPerson: null,
  setPersons: (persons) => set({ persons }),
  setCurrentPerson: (person) => set({ currentPerson: person }),
  addPerson: (person) =>
    set((state) => ({ persons: [...state.persons, person] })),
  updatePerson: (id, updates) =>
    set((state) => ({
      persons: state.persons.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentPerson:
        state.currentPerson?.id === id
          ? { ...state.currentPerson, ...updates }
          : state.currentPerson,
    })),
  removePerson: (id) =>
    set((state) => ({
      persons: state.persons.filter((p) => p.id !== id),
      currentPerson:
        state.currentPerson?.id === id ? null : state.currentPerson,
    })),
}));

// Chat store
export const useChatStore = create<ChatState>((set) => ({
  conversationId: null,
  messages: [],
  isStreaming: false,
  setConversationId: (id) => set({ conversationId: id }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [], conversationId: null }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
}));
