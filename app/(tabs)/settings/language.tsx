import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslations } from '../../../hooks/useTranslations';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { useState } from 'react';


export default function LanguageScreen() {
  const { language, setLanguage, getActiveTheme } = useSettingsStore();
  const { t } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLang, setPendingLang] = useState<'en' | 'ar' | null>(null);


  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    if (lang === language) return;

    if (lang === 'ar' || language === 'ar') {
      setPendingLang(lang);
      setShowConfirm(true);
    } else {
      setLanguage(lang);
    }
  };

  const confirmLanguageChange = () => {
    if (pendingLang) {
      setLanguage(pendingLang);
    }
    setShowConfirm(false);
  };

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={t('language')} showBack />
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.optionBtn, { borderColor: 'rgba(255,255,255,0.05)' }, language === 'en' && { backgroundColor: theme.colors.cardStart }]}
          onPress={() => handleLanguageSelect('en')}
        >
          <Text style={[globalStyles.text, styles.optionText]}>English (LTR)</Text>
          {language === 'en' && <MaterialCommunityIcons name="check" size={20} color={theme.colors.done} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionBtn, { borderColor: 'rgba(255,255,255,0.05)' }, language === 'ar' && { backgroundColor: theme.colors.cardStart }]}
          onPress={() => handleLanguageSelect('ar')}
        >
          <Text style={[globalStyles.text, styles.optionText]}>العربية (RTL)</Text>
          {language === 'ar' && <MaterialCommunityIcons name="check" size={20} color={theme.colors.done} />}
        </TouchableOpacity>

        <View style={styles.noticeBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.text} style={{ opacity: 0.5 }} />
          <Text style={[globalStyles.text, styles.noticeText]}>
            Hadaf uses industrial-grade RTL mirroring for Arabic support.
          </Text>
        </View>
      </View>

      <ConfirmModal
        visible={showConfirm}
        title={t('success')}
        message={t('restartMsg')}
        onConfirm={confirmLanguageChange}
        onCancel={() => setShowConfirm(false)}
        icon="translate"
      />
    </View>

  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Syne_500Medium',
  },
  noticeBox: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    gap: 12,
  },
  noticeText: {
    fontSize: 13,
    opacity: 0.5,
    flex: 1,
  },
});
