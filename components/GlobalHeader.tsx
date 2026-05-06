import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';
import { useTranslations } from '../hooks/useTranslations';

interface GlobalHeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightPress?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title = '',
  showBack = false,
  showSettings = false,
  rightIcon,
  onRightPress,
}) => {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const displayTitle = title || t('appName');

  return (
    <View style={[styles.container, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.leftSection, isRTL && { flexDirection: 'row-reverse' }]}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {!showBack && (
          <TouchableOpacity onPress={() => router.push('/about')} activeOpacity={0.7}>
            <Image source={require('../assets/icon.png')} style={[{ width: 32, height: 32, borderRadius: 8 }, isRTL ? { marginLeft: 12 } : { marginRight: 12 }]} />
          </TouchableOpacity>
        )}
        <Text style={globalStyles.heading}>{displayTitle}</Text>
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
