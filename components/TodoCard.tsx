import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Todo, Status } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { getGlobalStyles } from '../theme/theme';
import { format } from 'date-fns';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

interface TodoCardProps {
  item: Todo;
  drag: () => void;
  isActive: boolean;
  onStatusChange: (id: string, status: Status) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onNotify: (id: string) => void;
  onEdit: (id: string) => void;
  isCompact?: boolean;
  isReadOnly?: boolean;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  item,
  drag,
  isActive,
  onStatusChange,
  onArchive,
  onDelete,
  onNotify,
  onEdit,
  isCompact = false,
  isReadOnly = false,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const statusColor =
    item.status === 'done'
      ? theme.colors.done
      : item.status === 'in-progress'
        ? theme.colors.inProgress
        : theme.colors.pending;

  const [isNoteModalVisible, setIsNoteModalVisible] = React.useState(false);

  const renderRightActions = () => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity onPress={() => onNotify(item.id)} style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onArchive(item.id)} style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}>
          <MaterialCommunityIcons name={item.isArchived ? "backup-restore" : "archive-outline"} size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionBtn, { backgroundColor: theme.colors.pending }]}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={!isReadOnly ? renderRightActions : undefined}
      enabled={!isReadOnly}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.cardStart, theme.colors.cardEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            globalStyles.card,
            styles.cardOverride,
            { borderLeftWidth: 6, borderLeftColor: statusColor },
            isActive ? { opacity: 0.8, transform: [{ scale: 1.02 }] } : {},
            isCompact ? { padding: 12 } : {},
          ]}
        >
          <TouchableOpacity 
            onLongPress={!isReadOnly ? drag : undefined} 
            onPress={!isReadOnly ? () => onEdit(item.id) : undefined} 
            delayLongPress={200} 
            activeOpacity={isReadOnly ? 1 : 0.7} 
            style={{ flex: 1 }}
          >
            <View style={[styles.header, isCompact && { marginBottom: 8 }]}>
              <Text style={[globalStyles.subHeading, { flex: 1, fontSize: isCompact ? 14 : 16, color: theme.colors.text }]}>{item.name}</Text>

              {!isReadOnly && !isCompact && (
                <View style={styles.compactStatusPicker}>
                  <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onStatusChange(item.id, 'done'); }} style={[styles.statusItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.done }, item.status === 'done' && { opacity: 1 }]} />
                    <Text style={[styles.statusText, item.status === 'done' && { opacity: 1 }]}>{t('done')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onStatusChange(item.id, 'in-progress'); }} style={[styles.statusItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.inProgress }, item.status === 'in-progress' && { opacity: 1 }]} />
                    <Text style={[styles.statusText, item.status === 'in-progress' && { opacity: 1 }]}>{t('inProgress')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onStatusChange(item.id, 'pending'); }} style={[styles.statusItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.pending }, item.status === 'pending' && { opacity: 1 }]} />
                    <Text style={[styles.statusText, item.status === 'pending' && { opacity: 1 }]}>{t('pending')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.detailsRow, isCompact && { marginBottom: 8 }]}>
              {item.startDate && (
                <View style={[styles.detailItem, isRTL && { flexDirection: 'row-reverse' }]}>
                  <MaterialCommunityIcons name="calendar-start" size={14} color={theme.colors.text} style={{ opacity: 0.5 }} />
                  <Text style={[styles.detailLabel, isRTL && { marginRight: 0, marginLeft: 8 }]}>{t('start')}</Text>
                  <Text style={styles.detailValue}>{item.startDate ? format(new Date(item.startDate), 'MMM dd') : '...'}</Text>
                </View>
              )}
              {item.endDate && (
                <View style={[styles.detailItem, isRTL && { flexDirection: 'row-reverse' }]}>
                  <MaterialCommunityIcons name="calendar-end" size={14} color={theme.colors.text} style={{ opacity: 0.5 }} />
                  <Text style={[styles.detailLabel, isRTL && { marginRight: 0, marginLeft: 8 }]}>{t('end')}</Text>
                  <Text style={styles.detailValue}>{item.endDate ? format(new Date(item.endDate), 'MMM dd') : '...'}</Text>
                </View>
              )}
            </View>

            {item.location && !isCompact && (
              <View style={styles.locationContainer}>
                <View style={styles.locationIconBg}>
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.text} />
                </View>
                <Text style={[globalStyles.text, { fontSize: 13, opacity: 0.9, fontFamily: 'DMSans_400Regular' }]}>{item.location}</Text>
              </View>
            )}

            {item.notes && (
              <TouchableOpacity onPress={!isReadOnly ? () => setIsNoteModalVisible(true) : undefined} activeOpacity={isReadOnly ? 1 : 0.7}>
                <Text style={[globalStyles.text, styles.notes, isCompact && { padding: 8, fontSize: 11, borderRadius: 8 }]} numberOfLines={isCompact ? 2 : 3}>
                  {item.notes}
                </Text>
              </TouchableOpacity>
            )}

            {!isCompact && (
              <View style={styles.attachmentsContainer}>
                <View style={[styles.attachmentBadge, { backgroundColor: theme.colors.inProgress + '20', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <MaterialCommunityIcons name="link-variant" size={12} color={theme.colors.inProgress} />
                  <Text style={styles.attachmentText}>{t('nextActions')}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      <Modal visible={isNoteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.notesContent, { backgroundColor: theme.colors.cardEnd }]}>
            <Text style={[globalStyles.subHeading, { marginBottom: 12, textAlign: isRTL ? 'right' : 'left' }]}>{t('notes')}</Text>
            <Text style={[globalStyles.text, { opacity: 0.8, marginBottom: 20, textAlign: isRTL ? 'right' : 'left' }]}>{item.notes}</Text>
            <TouchableOpacity 
              style={[styles.closeNotesBtn, { backgroundColor: theme.colors.text }]} 
              onPress={() => setIsNoteModalVisible(false)}
            >
              <Text style={[globalStyles.text, { color: theme.colors.backgroundMain, fontFamily: 'Syne_600SemiBold' }]}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cardOverride: {
    marginBottom: 0,
    paddingLeft: 16, // Space for the refined status indicator
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden', // Ensures indicator follows card curve perfectly
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'DMSans_400Regular',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 6,
  },
  notes: {
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  attachmentText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    opacity: 0.8,
  },
  compactStatusPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.3,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Syne_600SemiBold',
    opacity: 0.3,
    textTransform: 'uppercase',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailValue: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'DMSans_500Medium',
    opacity: 0.8,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 4,
    width: 180,
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  notesContent: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeNotesBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});
