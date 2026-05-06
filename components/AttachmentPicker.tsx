import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { getGlobalStyles } from '../theme/theme';
import { pickFile, pickImage, takePhoto } from '../utils/attachments';
import { FileAttachment } from '../store/types';

interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onAttach: (attachment: FileAttachment) => void;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  visible,
  onClose,
  onAttach,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const handlePick = async (type: 'camera' | 'gallery' | 'files') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();

    // small delay so the modal closes before the native picker opens
    await new Promise((r) => setTimeout(r, 300));

    let attachment: FileAttachment | null = null;
    if (type === 'camera') attachment = await takePhoto();
    else if (type === 'gallery') attachment = await pickImage();
    else attachment = await pickFile();

    if (attachment) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAttach(attachment);
    }
  };

  const sources = [
    { key: 'camera', icon: 'camera-outline', label: t('fromCamera'), color: '#6366f1' },
    { key: 'gallery', icon: 'image-multiple-outline', label: t('fromGallery'), color: '#10b981' },
    { key: 'files', icon: 'folder-open-outline', label: t('fromFiles'), color: '#f59e0b' },
  ] as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.cardStart },
          ]}
        >
          <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={globalStyles.subHeading}>{t('addAttachment')}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={theme.colors.text} style={{ opacity: 0.6 }} />
            </TouchableOpacity>
          </View>

          <View style={[styles.sourceRow, isRTL && { flexDirection: 'row-reverse' }]}>
            {sources.map((src) => (
              <TouchableOpacity
                key={src.key}
                style={styles.sourceBtn}
                onPress={() => handlePick(src.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.sourceIconBg, { backgroundColor: src.color + '22' }]}>
                  <MaterialCommunityIcons name={src.icon as any} size={28} color={src.color} />
                </View>
                <Text style={[globalStyles.text, styles.sourceLabel]}>{src.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {Platform.OS === 'ios' && <View style={styles.homeIndicatorSpacer} />}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  sourceBtn: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sourceIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    opacity: 0.8,
  },
  homeIndicatorSpacer: {
    height: 24,
  },
});
