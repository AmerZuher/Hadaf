import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { ThemeConfig, ThemeColors } from './types';
import { I18nManager } from 'react-native';

export const defaultThemes: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      backgroundMain: '#020617',
      cardStart: '#0f172a',
      cardEnd: '#1e293b',
      done: '#10b981',
      inProgress: '#3b82f6',
      pending: '#ef4444',
      text: '#f8fafc',
      accent: '#6366f1',
    },
  },
  {
    id: 'nebula',
    name: 'Nebula',
    colors: {
      backgroundMain: '#000000',
      cardStart: '#0a0a0a',
      cardEnd: '#1a1a1a',
      done: '#10b981',
      inProgress: '#3b82f6',
      pending: '#ef4444',
      text: '#f8fafc',
      accent: '#f8fafc',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: {
      backgroundMain: '#022c22',
      cardStart: '#064e3b',
      cardEnd: '#065f46',
      done: '#10b981',
      inProgress: '#3b82f6',
      pending: '#ef4444',
      text: '#ecfdf5',
      accent: '#34d399',
    },
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    colors: {
      backgroundMain: '#1e1b4b',
      cardStart: '#1e1b4b',
      cardEnd: '#312e81',
      done: '#10b981',
      inProgress: '#3b82f6',
      pending: '#ef4444',
      text: '#f8fafc',
      accent: '#a855f7',
    },
  },
];

interface SettingsState {
  language: 'en' | 'ar';
  activeThemeId: string;
  customColors: Partial<Pick<ThemeColors, 'done' | 'inProgress' | 'pending'>>;
  setLanguage: (lang: 'en' | 'ar') => void;
  setTheme: (themeId: string) => void;
  setCustomColor: (status: keyof Pick<ThemeColors, 'done' | 'inProgress' | 'pending'>, color: string) => void;
  resetCustomColors: () => void;
  getActiveTheme: () => ThemeConfig;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'en',
      activeThemeId: 'midnight',
      customColors: {},

      setLanguage: (lang) => {
        set({ language: lang });
        const isRTL = lang === 'ar';
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }
      },

      setTheme: (themeId) => set({ activeThemeId: themeId }),

      setCustomColor: (status, color) => {
        set((state) => ({
          customColors: { ...state.customColors, [status]: color },
        }));
      },

      resetCustomColors: () => set({ customColors: {} }),

      getActiveTheme: () => {
        const { activeThemeId, customColors } = get();
        const baseTheme = defaultThemes.find((t) => t.id === activeThemeId) || defaultThemes[0];
        return {
          ...baseTheme,
          colors: {
            ...baseTheme.colors,
            ...customColors,
          },
        };
      },
    }),
    {
      name: 'hadaf-settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
