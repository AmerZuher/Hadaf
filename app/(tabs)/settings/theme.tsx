import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';

export default function ThemeScreen() {
  const { activeThemeId, setTheme, getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const availableThemes = [
    { id: 'midnight', name: 'Midnight', primary: '#020617', card: '#1e293b' },
    { id: 'sand', name: 'Sand', primary: '#fdfbf7', card: '#f5f3ed' },
  ];

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="Theme & Colors" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[globalStyles.subHeading, { marginBottom: 16 }]}>Select Theme</Text>
        <View style={styles.swatchGrid}>
          {availableThemes.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.swatch,
                { backgroundColor: t.primary },
                activeThemeId === t.id && { borderColor: theme.colors.text, borderWidth: 2 },
              ]}
              onPress={() => setTheme(t.id)}
            >
              <View style={[styles.swatchCard, { backgroundColor: t.card }]} />
              <Text style={[globalStyles.text, styles.swatchText, { color: activeThemeId === t.id ? theme.colors.text : '#888' }]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Placeholder for Color Pickers (Done, In Progress, Pending) */}
        <View style={styles.colorPickersSection}>
          <Text style={[globalStyles.subHeading, { marginBottom: 16 }]}>Custom Status Colors</Text>
          <View style={styles.colorRow}>
            <Text style={globalStyles.text}>Done</Text>
            <View style={[styles.colorCircle, { backgroundColor: theme.colors.done }]} />
          </View>
          <View style={styles.colorRow}>
            <Text style={globalStyles.text}>In Progress</Text>
            <View style={[styles.colorCircle, { backgroundColor: theme.colors.inProgress }]} />
          </View>
          <View style={styles.colorRow}>
            <Text style={globalStyles.text}>Pending</Text>
            <View style={[styles.colorCircle, { backgroundColor: theme.colors.pending }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  swatchGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  swatch: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'flex-end',
  },
  swatchCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    height: 40,
    borderRadius: 8,
    opacity: 0.8,
  },
  swatchText: {
    fontSize: 14,
    fontFamily: 'Syne_600SemiBold',
  },
  colorPickersSection: {
    marginTop: 20,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
