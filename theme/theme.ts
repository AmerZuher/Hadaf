import { StyleSheet } from 'react-native';
import { ThemeColors } from '../store/types';

/**
 * Safely adds alpha to a hex color string.
 * Handles both 6-char (#RRGGBB) and 8-char (#RRGGBBAA) hex.
 */
export const addAlpha = (hex: string, alpha: string): string => {
  if (!hex) return 'transparent';
  // Remove existing alpha if it's an 8-char hex
  const baseHex = hex.length === 9 ? hex.substring(0, 7) : hex;
  return `${baseHex}${alpha}`;
};


export const getGlobalStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMain,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: addAlpha(colors.text, '05'),
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  text: {
    color: colors.text,
    fontFamily: 'DMSans_400Regular',
  },
  heading: {
    color: colors.text,
    fontFamily: 'Syne_600SemiBold',
    fontSize: 24,
  },
  subHeading: {
    color: colors.text,
    fontFamily: 'Syne_500Medium',
    fontSize: 18,
  },
});
