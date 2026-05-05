import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Todo, Status } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';
import { format } from 'date-fns';

interface TodoCardProps {
  item: Todo;
  drag: () => void;
  isActive: boolean;
  onStatusChange: (id: string, status: Status) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onNotify: (id: string) => void;
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

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.cardStart }]} onPress={() => onArchive(item.id)}>
          <MaterialCommunityIcons name="archive" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.cardStart }]} onPress={() => onNotify(item.id)}>
          <MaterialCommunityIcons name="bell" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.pending }]} onPress={() => onDelete(item.id)}>
          <MaterialCommunityIcons name="trash-can" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

          <View
        style={[
          globalStyles.card,
          styles.cardOverride,
          { borderRightColor: statusColor, borderRightWidth: 4 },
          isActive ? { opacity: 0.8, transform: [{ scale: 1.02 }] } : {},
        ]}
      >
        <TouchableOpacity onLongPress={drag} delayLongPress={200} activeOpacity={1}>
          <View style={styles.header}>
            <Text style={[globalStyles.subHeading, { flex: 1, fontSize: 16 }]}>{item.name}</Text>
          </View>
          
          <View style={styles.detailsRow}>
            {item.startDate && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailLabel}>Start</Text>
                <Text style={[globalStyles.text, { fontSize: 12 }]}>
                  {format(new Date(item.startDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
            {item.endDate && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailLabel}>End</Text>
                <Text style={[globalStyles.text, { fontSize: 12 }]}>
                  {format(new Date(item.endDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>

          {item.location && (
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.text} />
              <Text style={[globalStyles.text, { fontSize: 12, opacity: 0.8 }]}>{item.location}</Text>
            </View>
          )}

          {item.notes && (
            <Text style={[globalStyles.text, styles.notes]} numberOfLines={2}>
              {item.notes}
            </Text>
          )}

          <View style={styles.statusPicker}>
            <TouchableOpacity onPress={() => onStatusChange(item.id, 'done')} style={[styles.statusBtn, item.status === 'done' && { backgroundColor: theme.colors.done }]}>
              <Text style={styles.statusBtnText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onStatusChange(item.id, 'in-progress')} style={[styles.statusBtn, item.status === 'in-progress' && { backgroundColor: theme.colors.inProgress }]}>
              <Text style={styles.statusBtnText}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onStatusChange(item.id, 'pending')} style={[styles.statusBtn, item.status === 'pending' && { backgroundColor: theme.colors.pending }]}>
              <Text style={styles.statusBtnText}>Pending</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cardOverride: {
    marginBottom: 0,
    backgroundColor: '#1e293b', // Base off the reference HTML linear gradient
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
    gap: 4,
    marginBottom: 12,
  },
  notes: {
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
  },
  statusPicker: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 4,
    borderRadius: 16,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  statusBtnText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Syne_600SemiBold',
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 10,
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
