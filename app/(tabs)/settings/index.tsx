import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';    
import { useSettingsStore } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';
import { GlobalHeader } from '../../../components/GlobalHeader';

const settingsLinks = [
  { id: 'language', name: 'Language', icon: 'translate', path: '/(tabs)/settings/language' },
  { id: 'theme', name: 'Theme & Colors', icon: 'palette-swatch-outline', path: '/(tabs)/settings/theme' },
  { id: 'backup', name: 'Backup & Data', icon: 'database-outline', path: '/(tabs)/settings/backup' },
  { id: 'about', name: 'About', icon: 'information-outline', path: '/(tabs)/settings/about' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.list}>
        {settingsLinks.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={[styles.item, { backgroundColor: theme.colors.cardStart }]}
            onPress={() => router.push(link.path as any)}
          >
            <View style={styles.itemLeft}>
              <MaterialCommunityIcons name={link.icon as any} size={24} color={theme.colors.text} />
              <Text style={[globalStyles.subHeading, { fontSize: 16, marginLeft: 16 }]}>{link.name}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} style={{ opacity: 0.5 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
