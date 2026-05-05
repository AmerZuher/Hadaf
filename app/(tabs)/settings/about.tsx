import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';

export default function AboutScreen() {
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="About" showBack />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={[globalStyles.heading, { fontSize: 48 }]}>Azm</Text>
          <Text style={globalStyles.text}>Version 1.0.0</Text>
        </View>
        <Text style={[globalStyles.text, styles.desc]}>
          Azm is a sleek, modern mobile productivity app designed to keep your focus sharp and your tasks moving.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  desc: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
});
