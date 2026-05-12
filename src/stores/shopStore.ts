import { create } from 'zustand';
import api from '../lib/api';
import type { ShopCatalog } from '../types/api';
import { useAuthStore } from './authStore';

interface ShopState {
  catalog: ShopCatalog | null;
  isLoading: boolean;
  isPurchasing: boolean;

  fetchCatalog: () => Promise<void>;
  purchaseAvatar: (index: number) => Promise<void>;
  purchaseMode: (mode: string) => Promise<void>;
}

export const useShopStore = create<ShopState>((set) => ({
  catalog: null,
  isLoading: false,
  isPurchasing: false,

  fetchCatalog: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/shop/catalog');
      set({ catalog: data });
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseAvatar: async (index) => {
    set({ isPurchasing: true });
    try {
      await api.post(`/shop/avatar/${index}`);
      await useAuthStore.getState().refreshUser();
      const { data } = await api.get('/shop/catalog');
      set({ catalog: data });
    } finally {
      set({ isPurchasing: false });
    }
  },

  purchaseMode: async (mode) => {
    set({ isPurchasing: true });
    try {
      await api.post(`/shop/mode/${mode}`);
      await useAuthStore.getState().refreshUser();
      const { data } = await api.get('/shop/catalog');
      set({ catalog: data });
    } finally {
      set({ isPurchasing: false });
    }
  },
}));
