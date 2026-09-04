import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/shared/model/types/user';

interface AuthState {
  user: User | null;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      hasHydrated: false,
      setUser: user => set({ user }),
      setHasHydrated: hasHydrated => set({ hasHydrated }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
      partialize: state => ({ user: state.user }),
    }
  )
);
