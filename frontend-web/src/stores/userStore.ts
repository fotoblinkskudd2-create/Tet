import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  subscription: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: "leanlife-auth" }
  )
);
