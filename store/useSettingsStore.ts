import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { ThemeConfig, ThemeColors } from './types';
import { I18nManager } from 'react-native';

const defaultThemes: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      backgroundMain: '#020617',
      cardStart: '#1e293b',
      cardEnd: '#0f172a',
      done: '#10b981',
      inProgress: '#f59e0b',
      pending: '#f43f5e',
      text: '#f1f5f9',
    },
  },
  {
    id: 'sand',
    name: 'Sand',
    colors: {
      backgroundMain: '#fdfbf7',
      cardStart: '#f5f3ed',
      cardEnd: '#eceae4',
      done: '#059669',
      inProgress: '#d97706',
      pending: '#e11d48',
      text: '#1c1917',
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
      name: 'azm-settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
