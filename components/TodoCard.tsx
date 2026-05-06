import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Todo, Status } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { getGlobalStyles } from '../theme/theme';
import { format } from 'date-fns';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { ConfirmModal } from './ConfirmModal';

import { AttachmentList } from './AttachmentList';

interface TodoCardProps {
  item: Todo;
  drag: () => void;
  isActive: boolean;
  onStatusChange: (id: string, status: Status) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onNotify: (id: string) => void;
  onEdit: (id: string) => void;
  onAddAttachment?: (id: string) => void;
  onRemoveAttachment?: (todoId: string, attachmentId: string) => void;
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
  onAddAttachment,
  onRemoveAttachment,
  isCompact = false,
  isReadOnly = false,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const swipeableRef = useRef<Swipeable>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const statusColor =
    item.status === 'done'
      ? theme.colors.done
      : item.status === 'in-progress'
        ? theme.colors.inProgress
        : theme.colors.pending;

  const [isNoteModalVisible, setIsNoteModalVisible] = React.useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);


  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scaleNotify = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
      extrapolate: 'clamp',
    });
    const scaleArchive = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });
    const scaleDelete = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionsContainer}>
        <Animated.View style={[styles.actionBtnWrapper, { opacity, transform: [{ scale: scaleNotify }] }]}>
          <TouchableOpacity onPress={() => { swipeableRef.current?.close(); onNotify(item.id); }} style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionBtnWrapper, { opacity, transform: [{ scale: scaleArchive }] }]}>
          <TouchableOpacity onPress={() => { swipeableRef.current?.close(); onArchive(item.id); }} style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}>
            <MaterialCommunityIcons name={item.isArchived ? "backup-restore" : "archive-outline"} size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionBtnWrapper, { opacity, transform: [{ scale: scaleDelete }] }]}>
          <TouchableOpacity onPress={() => { setIsDeleteModalVisible(true); }} style={[styles.actionBtn, { backgroundColor: theme.colors.pending }]}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
        </TouchableOpacity>

        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={!isReadOnly ? renderRightActions : undefined}
      enabled={!isReadOnly}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      rightThreshold={40}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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

            <View style={styles.contentBody}>
              {(item.startDate || item.endDate) && (
                <View style={[styles.detailsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  {item.startDate && (
                    <View style={[styles.detailItem, { borderColor: statusColor + '20', borderLeftColor: statusColor, borderLeftWidth: 3 }, isRTL && { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: statusColor }]}>
                      <MaterialCommunityIcons name="calendar-start" size={12} color={statusColor} />
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 4 }}>
                        <Text style={[styles.detailLabel, { color: theme.colors.text, opacity: 0.5 }]}>{t('start')}</Text>
                        <Text style={styles.detailValue}>{format(new Date(item.startDate), 'MMM dd')}</Text>
                      </View>
                    </View>
                  )}
                  {item.endDate && (
                    <View style={[styles.detailItem, { borderColor: statusColor + '20', borderLeftColor: statusColor, borderLeftWidth: 3 }, isRTL && { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: statusColor }]}>
                      <MaterialCommunityIcons name="calendar-end" size={12} color={statusColor} />
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 4 }}>
                        <Text style={[styles.detailLabel, { color: theme.colors.text, opacity: 0.5 }]}>{t('end')}</Text>
                        <Text style={styles.detailValue}>{format(new Date(item.endDate), 'MMM dd')}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {item.location && !isCompact && (
                <View style={[styles.locationContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[styles.locationPill, { borderColor: statusColor + '20', borderLeftColor: statusColor, borderLeftWidth: 3 }, isRTL && { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: statusColor }]}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color={statusColor} />
                    <Text style={[styles.locationText, { color: theme.colors.text, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>
              )}

              {item.notes && (
                <TouchableOpacity 
                  onPress={!isReadOnly ? () => setIsNoteModalVisible(true) : undefined} 
                  activeOpacity={isReadOnly ? 1 : 0.7}
                  style={styles.notesWrapper}
                >
                  <View style={[styles.notesPill, { borderColor: statusColor + '20', borderLeftColor: statusColor, borderLeftWidth: 3 }, isRTL && { borderLeftWidth: 0, borderRightWidth: 3, borderRightColor: statusColor }]}>
                    <MaterialCommunityIcons name="note-text-outline" size={14} color={statusColor} style={{ opacity: 0.8 }} />
                    <Text style={[globalStyles.text, styles.notes, isCompact && { fontSize: 11 }]} numberOfLines={isCompact ? 2 : 3}>
                      {item.notes}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {!isCompact && (
                <View style={styles.attachmentSection}>
                  <AttachmentList
                    attachments={item.attachments ?? []}
                    onRemove={onRemoveAttachment ? (attId) => onRemoveAttachment(item.id, attId) : undefined}
                    isReadOnly={isReadOnly}
                    accentColor={statusColor}
                  />
                  {!isReadOnly && (
                    <TouchableOpacity
                      style={[styles.addAttachBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                      onPress={() => onAddAttachment?.(item.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="plus-circle-outline" size={14} color={statusColor} style={{ opacity: 0.6 }} />
                      <Text style={[styles.addAttachText, { color: statusColor }]}>{t('addAttachment')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
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
      <ConfirmModal
        visible={isDeleteModalVisible}
        title={t('delete')}
        message={t('deleteObjectiveMsg')} // Reuse or generic task delete msg
        confirmText={t('delete')}
        onConfirm={() => {
          setIsDeleteModalVisible(false);
          swipeableRef.current?.close();
          onDelete(item.id);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        type="danger"
        icon="trash-can-outline"
      />
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
  contentBody: {
    gap: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'DMSans_400Regular',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '95%',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  locationText: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    opacity: 0.8,
  },
  notesWrapper: {
    width: '100%',
  },
  notesPill: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  notes: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    opacity: 0.8,
    flex: 1,
  },
  attachmentSection: {
    marginTop: 4,
    gap: 10,
  },
  addAttachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingVertical: 4,
    opacity: 0.5,
  },
  addAttachText: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
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

  detailValue: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'DMSans_500Medium',
    opacity: 0.8,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 8,
    width: 220,
  },
  actionBtnWrapper: {
    flex: 1,
    paddingVertical: 2,
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
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
