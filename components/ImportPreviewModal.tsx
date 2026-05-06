import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImportPreview } from '../utils/objectiveExport';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { useCategoryStore } from '../store/useCategoryStore';

interface ImportPreviewModalProps {
  visible: boolean;
  preview: ImportPreview | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  visible,
  preview,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const { getAllCategories } = useCategoryStore();

  if (!preview) return null;

  const categories = getAllCategories();
  const category = categories.find(c => c.id === preview.data.objective.categoryId) || categories[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.cardStart }]}>
          <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('importPreview')}</Text>
            <TouchableOpacity onPress={onCancel} disabled={isLoading}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
              <MaterialCommunityIcons name={category.icon as any} size={32} color={category.color} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.objName, { color: theme.colors.text }]}>{preview.name}</Text>
              <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="format-list-checks" size={14} color={theme.colors.text} style={{ opacity: 0.5 }} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>{preview.todoCount} {t('objectives')}</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="paperclip" size={14} color={theme.colors.text} style={{ opacity: 0.5 }} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>{preview.attachmentCount} {t('attachments')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.footer, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: 'rgba(255,255,255,0.1)' }]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={[styles.cancelText, { color: theme.colors.text }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: theme.colors.text }]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.backgroundMain} />
              ) : (
                <Text style={[styles.importText, { color: theme.colors.backgroundMain }]}>{t('importData')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 18,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  objName: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 15,
  },
  importBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 15,
  },
});
