// src/store/themeStore.ts
import { create } from 'zustand';
import { storage } from '@/utils/storage';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: false,

  toggleTheme: () => {
    const nextMode = !get().isDarkMode;
    set({ isDarkMode: nextMode });
    storage.setItem('ubssuper_dark_mode', nextMode);
  },

  loadTheme: async () => {
    const saved = await storage.getItem<boolean>('ubssuper_dark_mode');
    if (saved !== null) {
      set({ isDarkMode: saved });
    }
  },
}));
