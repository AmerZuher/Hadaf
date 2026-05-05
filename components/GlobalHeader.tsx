import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';

interface GlobalHeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightPress?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title = 'Hadaf',
  showBack = false,
  showSettings = false,
  rightIcon,
  onRightPress,
}) => {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {!showBack && (
          <MaterialCommunityIcons name="lightning-bolt" size={28} color={theme.colors.text} style={{ marginRight: 8 }} />
        )}
        <Text style={globalStyles.heading}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {showSettings && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.iconButton}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {rightIcon && onRightPress && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            <MaterialCommunityIcons name={rightIcon} size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
});
