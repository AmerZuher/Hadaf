import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';

export type PresentationMode = 'cards' | 'grid' | 'minimal';

interface PresentationSwitcherProps {
  activeMode: PresentationMode;
  onModeChange: (mode: PresentationMode) => void;
}

const modes: { id: PresentationMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'cards', icon: 'view-agenda-outline' },
  { id: 'grid', icon: 'view-grid-outline' },
  { id: 'minimal', icon: 'format-list-bulleted' },
];

export const PresentationSwitcher: React.FC<PresentationSwitcherProps> = ({ activeMode, onModeChange }) => {
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.inner, { backgroundColor: theme.colors.cardStart }]}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.btn,
              activeMode === mode.id && { backgroundColor: theme.colors.cardEnd, borderColor: 'rgba(255,255,255,0.1)' },
            ]}
            onPress={() => onModeChange(mode.id)}
          >
            <MaterialCommunityIcons
              name={mode.icon}
              size={20}
              color={theme.colors.text}
              style={{ opacity: activeMode === mode.id ? 1 : 0.4 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inner: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
