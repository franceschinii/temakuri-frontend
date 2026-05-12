import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/api';
import api from '../lib/api';
import { connectSocket, disconnectSocket, isSocketConnected, reconnectSocket } from '../lib/socket';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isGuest: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginAsGuest: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  initSocket: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isGuest: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, accessToken: data.accessToken, isGuest: false });
        connectSocket(data.accessToken);
      },

      register: async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, accessToken: data.accessToken, isGuest: false });
        connectSocket(data.accessToken);
      },

      loginAsGuest: async (username) => {
        const { data } = await api.post('/auth/guest', { username });
        localStorage.setItem('accessToken', data.accessToken);
        set({ user: data.user, accessToken: data.accessToken, isGuest: true });
        connectSocket(data.accessToken);
      },

      logout: async () => {
        // Close socket first (intentional), then fire-and-forget logout API
        disconnectSocket(true);
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) api.post('/auth/logout', { refreshToken }).catch(() => {});
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('temakuri-auth');
        set({ user: null, accessToken: null, isGuest: false });
      },

      setUser: (user) => set({ user }),

      setAccessToken: (token) => {
        set({ accessToken: token });
        localStorage.setItem('accessToken', token);
        // Reconnect socket with fresh token if disconnected
        if (!isSocketConnected()) reconnectSocket(token);
      },

      initSocket: () => {
        const token = get().accessToken;
        if (token && !isSocketConnected()) connectSocket(token);
      },

      refreshUser: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('temakuri-auth');
          set({ user: null, accessToken: null, isGuest: false });
        }
      },
    }),
    {
      name: 'temakuri-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isGuest: state.isGuest }),
    },
  ),
);
