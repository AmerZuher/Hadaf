import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LanguageScreen() {
  const { language, setLanguage, getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="Language" showBack />
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.optionBtn, language === 'en' && { backgroundColor: theme.colors.cardStart }]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[globalStyles.text, styles.optionText]}>English (LTR)</Text>
          {language === 'en' && <MaterialCommunityIcons name="check" size={20} color={theme.colors.done} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionBtn, language === 'ar' && { backgroundColor: theme.colors.cardStart }]}
          onPress={() => setLanguage('ar')}
        >
          <Text style={[globalStyles.text, styles.optionText]}>العربية (RTL)</Text>
          {language === 'ar' && <MaterialCommunityIcons name="check" size={20} color={theme.colors.done} />}
        </TouchableOpacity>
      </View>
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Syne_500Medium',
  },
});
