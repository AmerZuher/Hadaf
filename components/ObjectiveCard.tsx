import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Objective, Todo, Status } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useObjectiveStore } from '../store/useObjectiveStore';
import { getGlobalStyles } from '../theme/theme';
import { format, isAfter } from 'date-fns';

interface ObjectiveCardProps {
  objective: Objective;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective }) => {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const { getAllCategories } = useCategoryStore();
  const { todos } = useObjectiveStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const categories = getAllCategories();
  const category = categories.find((c) => c.id === objective.categoryId) || categories[0];

  const objTodos = todos.filter((t) => t.objectiveId === objective.id && !t.isArchived);
  const total = objTodos.length;
  const doneCount = objTodos.filter((t) => t.status === 'done').length;
  const progress = total === 0 ? 0 : (doneCount / total) * 100;

  const now = new Date();
  const upcomingTodos = objTodos
    .filter((t) => t.endDate && isAfter(new Date(t.endDate), now) && t.status !== 'done')
    .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());

  const nextMilestone = upcomingTodos.length > 0 ? upcomingTodos[0] : null;

  return (
    <TouchableOpacity
      style={globalStyles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/objective/${objective.id}`)}
    >
      <View style={styles.header}>
        <Text style={[globalStyles.subHeading, { flex: 1 }]}>{objective.name}</Text>
        <View style={[styles.badge, { backgroundColor: `${category.color}20` }]}>
          <MaterialCommunityIcons name={category.icon as any} size={16} color={category.color} />
          <Text style={[styles.badgeText, { color: category.color }]}>{category.name}</Text>
        </View>
      </View>

      <Text style={[globalStyles.text, styles.dateText]}>
        Started: {format(new Date(objective.createdAt), 'MMM d, yyyy')}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={globalStyles.text}>Progress</Text>
          <Text style={globalStyles.text}>{Math.round(progress)}%</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.colors.done }]} />
        </View>
      </View>

      {nextMilestone && (
        <View style={styles.milestoneContainer}>
          <MaterialCommunityIcons name="flag-triangle" size={16} color={theme.colors.pending} />
          <Text style={[globalStyles.text, styles.milestoneText]}>
            Next: {nextMilestone.name} ({format(new Date(nextMilestone.endDate!), 'MMM d')})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 12,
  },
  milestoneText: {
    fontSize: 13,
    opacity: 0.9,
  },
});
