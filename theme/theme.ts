import { StyleSheet } from 'react-native';
import { ThemeColors } from '../store/types';

export const getGlobalStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMain,
  },
  card: {
    backgroundColor: colors.cardStart,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
