import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSettingsStore, defaultThemes } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';
import { GlobalHeader } from '../components/GlobalHeader';

const SettingsScreen = () => {
  const { getActiveTheme, setTheme, activeThemeId } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="Settings" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[globalStyles.subHeading, styles.sectionTitle]}>Theme Selection</Text>
        
        <View style={styles.themesGrid}>
          {defaultThemes.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.themeCard,
                { backgroundColor: t.colors.cardStart },
                activeThemeId === t.id && { borderColor: t.colors.text, borderWidth: 2 }
              ]}
              onPress={() => setTheme(t.id)}
            >
              <Text style={[styles.themeName, { color: t.colors.text }]}>{t.name}</Text>
              
              <View style={styles.colorPreviewRow}>
                <View style={[styles.colorDot, { backgroundColor: t.colors.backgroundMain }]} />
                <View style={[styles.colorDot, { backgroundColor: t.colors.done }]} />
                <View style={[styles.colorDot, { backgroundColor: t.colors.inProgress }]} />
                <View style={[styles.colorDot, { backgroundColor: t.colors.pending }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  themesGrid: {
    gap: 16,
  },
  themeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
  },
  colorPreviewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
