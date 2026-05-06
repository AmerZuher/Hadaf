import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles, addAlpha } from '../theme/theme';

import { useTranslations } from '../hooks/useTranslations';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  type?: 'danger' | 'info' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  icon = 'alert-circle-outline',
  type = 'info',
}) => {
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const { t, isRTL } = useTranslations();

  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const getAccentColor = () => {
    switch (type) {
      case 'danger': return theme.colors.pending;
      case 'warning': return theme.colors.inProgress;
      default: return theme.colors.done;
    }
  };


  const accentColor = getAccentColor();

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity 
          activeOpacity={1} 
          style={StyleSheet.absoluteFill} 
          onPress={onCancel}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              opacity: fadeAnim, 
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme.colors.backgroundMain,
              borderColor: addAlpha(accentColor, '40'),
            }

          ]}
        >
          <LinearGradient
            colors={[addAlpha(accentColor, '10'), 'transparent']}
            style={styles.gradientHeader}
          />

          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: addAlpha(accentColor, '15') }]}>
              <MaterialCommunityIcons name={icon} size={32} color={accentColor} />
            </View>
          </View>


          <Text style={[globalStyles.heading, styles.title, { textAlign: 'center' }]}>{title}</Text>
          <Text style={[globalStyles.text, styles.message, { textAlign: 'center' }]}>{message}</Text>

          <View style={[styles.buttonRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={[styles.btn, styles.cancelBtn]} 
              onPress={onCancel}
            >
              <Text style={[globalStyles.text, { opacity: 0.6 }]}>{cancelText || t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.confirmBtn, { backgroundColor: accentColor }]} 
              onPress={onConfirm}
            >
              <Text style={[globalStyles.text, { fontFamily: 'Syne_600SemiBold', color: theme.colors.backgroundMain }]}>
                {confirmText || t('confirm')}
              </Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    overflow: 'hidden',
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  confirmBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
