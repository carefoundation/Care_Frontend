import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  token: string | null;
}

interface AppState {
  user: User;
  theme: 'light' | 'dark';
  isLoading: boolean;
  setUser: (user: Partial<User>) => void;
  clearUser: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: {
        id: null,
        name: null,
        email: null,
        token: null,
      },
      theme: 'light',
      isLoading: false,
      setUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      clearUser: () => {
        set({
          user: {
            id: null,
            name: null,
            email: null,
            token: null,
          },
        });
      },
      setTheme: (theme) => {
        set({ theme });
      },
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
      }),
    }
  )
);

