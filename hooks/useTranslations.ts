import { useSettingsStore } from '../store/useSettingsStore';
import { TRANSLATIONS, TranslationKeys } from '../constants/Translations';

export const useTranslations = () => {
  const { language } = useSettingsStore();
  
  const t = (key: TranslationKeys): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
  };

  return { t, language, isRTL: language === 'ar' };
};
