// src/store/favoritesStore.ts
import { create } from 'zustand';
import { storage } from '@/utils/storage';
import { useAuthStore } from './authStore';
import { useCartStore } from './cartStore';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],

  toggleFavorite: (id: string) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      useCartStore.getState().openLoginModal();
      return false;
    }

    const { favoriteIds } = get();
    const exists = favoriteIds.includes(id);
    const updated = exists ? favoriteIds.filter((fId) => fId !== id) : [...favoriteIds, id];
    set({ favoriteIds: updated });
    storage.setItem('ubssuper_favorites', updated);
    return true;
  },

  isFavorite: (id: string) => {
    return get().favoriteIds.includes(id);
  },

  loadFavorites: async () => {
    const saved = await storage.getItem<string[]>('ubssuper_favorites');
    if (saved) {
      set({ favoriteIds: saved });
    }
  },
}));
