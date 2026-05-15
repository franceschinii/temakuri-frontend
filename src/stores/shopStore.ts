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
  purchaseTheme: (key: string) => Promise<void>;
  setActiveTheme: (key: string | null) => Promise<void>;
  purchaseCoinPack: (sku: string) => Promise<void>;
  useUtility: (sku: string) => Promise<void>;

  // Mercado Pago checkout (Fase A: retorna 503 se PAYMENTS_ENABLED=false).
  // O endpoint retorna o init_point do MP, que e a URL para redirect.
  startDiamondCheckout: (sku: string, couponCode?: string) => Promise<string>;
  startPremiumCheckout: () => Promise<string>;
  cancelPremium: () => Promise<void>;
}

async function refreshAll(set: (s: Partial<ShopState>) => void) {
  await useAuthStore.getState().refreshUser();
  const { data } = await api.get('/shop/catalog');
  set({ catalog: data });
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
      await refreshAll(set);
    } finally {
      set({ isPurchasing: false });
    }
  },

  purchaseMode: async (mode) => {
    set({ isPurchasing: true });
    try {
      await api.post(`/shop/mode/${mode}`);
      await refreshAll(set);
    } finally {
      set({ isPurchasing: false });
    }
  },

  purchaseTheme: async (key) => {
    set({ isPurchasing: true });
    try {
      await api.post(`/shop/theme/${key}`);
      await refreshAll(set);
    } finally {
      set({ isPurchasing: false });
    }
  },

  setActiveTheme: async (key) => {
    await api.post('/shop/theme/active', { theme: key });
    await useAuthStore.getState().refreshUser();
  },

  purchaseCoinPack: async (sku) => {
    set({ isPurchasing: true });
    try {
      await api.post(`/shop/coin-pack/${sku}`);
      await refreshAll(set);
    } finally {
      set({ isPurchasing: false });
    }
  },

  useUtility: async (sku) => {
    set({ isPurchasing: true });
    try {
      await api.post(`/shop/utility/${sku}`);
      await refreshAll(set);
    } finally {
      set({ isPurchasing: false });
    }
  },

  startDiamondCheckout: async (sku, couponCode) => {
    const { data } = await api.post('/payments/diamonds/checkout', { sku, couponCode });
    return data.url as string;
  },

  startPremiumCheckout: async () => {
    const { data } = await api.post('/payments/premium/checkout');
    return data.url as string;
  },

  cancelPremium: async () => {
    await api.post('/payments/premium/cancel');
    await useAuthStore.getState().refreshUser();
  },
}));
