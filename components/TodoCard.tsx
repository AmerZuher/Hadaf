import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, I18nManager } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Todo, Status } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
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

const ACTION_WIDTH = 180; // 3 actions * 60 width

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
                  <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onStatusChange(item.id, 'done'); }} style={[styles.compactStatusBtn, item.status === 'done' && { backgroundColor: theme.colors.done }]}>
                    <Text style={[styles.statusText, item.status === 'done' && { opacity: 1 }]}>Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onStatusChange(item.id, 'in-progress'); }} style={[styles.compactStatusBtn, item.status === 'in-progress' && { backgroundColor: theme.colors.inProgress }]}>
                    <Text style={[styles.statusText, item.status === 'in-progress' && { opacity: 1 }]}>Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onStatusChange(item.id, 'pending'); }} style={[styles.compactStatusBtn, item.status === 'pending' && { backgroundColor: theme.colors.pending }]}>
                    <Text style={[styles.statusText, item.status === 'pending' && { opacity: 1 }]}>Wait</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.detailsRow, isCompact && { marginBottom: 8 }]}>
              {item.startDate && (
                <View style={[styles.detailBadge, isCompact && { paddingVertical: 4 }]}>
                  <Text style={styles.detailLabel}>Start</Text>
                  <Text style={[globalStyles.text, { fontSize: isCompact ? 10 : 12 }]}>
                    {format(new Date(item.startDate), 'MMM d')}
                  </Text>
                </View>
              )}
              {!isCompact && item.endDate && (
                <View style={styles.detailBadge}>
                  <Text style={styles.detailLabel}>End</Text>
                  <Text style={[globalStyles.text, { fontSize: 12 }]}>
                    {format(new Date(item.endDate), 'MMM d')}
                  </Text>
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
                <View style={styles.attachmentBadge}>
                  <MaterialCommunityIcons name="paperclip" size={14} color={theme.colors.text} />
                  <Text style={styles.attachmentText}>Next Actions</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      {/* Notes Popup Modal */}
      <Modal visible={isNoteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.noteModalContent, { backgroundColor: theme.colors.cardStart }]}>
            <Text style={[globalStyles.subHeading, { marginBottom: 12 }]}>Notes</Text>
            <Text style={[globalStyles.text, { lineHeight: 24, opacity: 0.9 }]}>{item.notes}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsNoteModalVisible(false)}>
              <Text style={[globalStyles.text, { color: theme.colors.backgroundMain, fontFamily: 'Syne_600SemiBold' }]}>Close</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 2,
    borderRadius: 14,
    gap: 2,
  },
  compactStatusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 9,
    color: '#fff',
    fontFamily: 'Syne_600SemiBold',
    opacity: 0.3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 4,
    width: 200, // Fixed width for 3 actions
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  noteModalContent: {
    padding: 24,
    borderRadius: 24,
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});
