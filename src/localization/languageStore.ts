// src/localization/languageStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, LanguageOption, RTL_LANGUAGES } from './languageConfig';
import { updateRtlLayout } from './rtlManager';

export const LANGUAGE_STORAGE_KEY = '@ubs_app_language';
export const LANGUAGE_SELECTED_KEY = '@ubs_language_selected';

interface LanguageState {
  currentLanguage: string;
  isRTL: boolean;
  hasSelectedLanguage: boolean;
  isInitialized: boolean;
  setLanguage: (code: string) => Promise<void>;
  initializeLanguage: () => Promise<void>;
  getLanguageOption: (code?: string) => LanguageOption;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  isRTL: false,
  hasSelectedLanguage: false,
  isInitialized: false,

  setLanguage: async (code: string) => {
    const isRTL = RTL_LANGUAGES.includes(code);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
      await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
    } catch (e) {
      console.warn('[LanguageStore] Failed to persist language:', e);
    }
    updateRtlLayout(isRTL);

    set({
      currentLanguage: code,
      isRTL,
      hasSelectedLanguage: true,
    });
  },

  initializeLanguage: async () => {
    try {
      const [savedLang, hasSelected] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_SELECTED_KEY),
      ]);

      const langCode = savedLang || 'en';
      const isRTL = RTL_LANGUAGES.includes(langCode);
      updateRtlLayout(isRTL);

      set({
        currentLanguage: langCode,
        isRTL,
        hasSelectedLanguage: hasSelected === 'true',
        isInitialized: true,
      });
    } catch (err) {
      console.warn('[LanguageStore] Initialization error:', err);
      set({ isInitialized: true });
    }
  },

  getLanguageOption: (code?: string) => {
    const targetCode = code || get().currentLanguage;
    return LANGUAGES.find((l) => l.code === targetCode) || LANGUAGES[0];
  },
}));
