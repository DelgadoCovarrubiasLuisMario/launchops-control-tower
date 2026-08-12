import { create } from 'zustand';
import type { AuthUser } from './types';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setSession: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const storedToken = localStorage.getItem('launchops.token');
const storedUser = localStorage.getItem('launchops.user');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
  setSession: (user, token) => {
    localStorage.setItem('launchops.token', token);
    localStorage.setItem('launchops.user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('launchops.token');
    localStorage.removeItem('launchops.user');
    set({ user: null, token: null });
  }
}));
