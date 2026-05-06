import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';    
import { useSettingsStore } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useTranslations } from '../../../hooks/useTranslations';
import { TranslationKeys } from '../../../constants/Translations';

export default function SettingsScreen() {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const settingsLinks: { id: string; name: string; icon: string; path: string; tKey: TranslationKeys }[] = [
    { id: 'language', name: 'Language', icon: 'translate', path: '/(tabs)/settings/language', tKey: 'language' },
    { id: 'theme', name: 'Theme & Colors', icon: 'palette-swatch-outline', path: '/(tabs)/settings/theme', tKey: 'theme' },
    { id: 'backup', name: 'Backup & Data', icon: 'database-outline', path: '/(tabs)/settings/backup', tKey: 'backup' },
    { id: 'about', name: 'About', icon: 'information-outline', path: '/about', tKey: 'about' },
  ];

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={t('settings')} showBack />
      <ScrollView contentContainerStyle={styles.list}>
        {settingsLinks.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={[styles.item, { backgroundColor: theme.colors.cardStart, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => router.push(link.path as any)}
          >
            <View style={[styles.itemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <MaterialCommunityIcons name={link.icon as any} size={24} color={theme.colors.text} />
              <Text style={[globalStyles.subHeading, { fontSize: 16, marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
                {t(link.tKey)}
              </Text>
            </View>
            <MaterialCommunityIcons 
              name={isRTL ? "chevron-left" : "chevron-right"} 
              size={24} 
              color={theme.colors.text} 
              style={{ opacity: 0.5 }} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemLeft: {
    alignItems: 'center',
  },
});
