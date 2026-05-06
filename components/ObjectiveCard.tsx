import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ActivityIndicator, Modal } from 'react-native';

import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Objective, Todo } from '../store/types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useObjectiveStore } from '../store/useObjectiveStore';
import { useTranslations } from '../hooks/useTranslations';
import { getGlobalStyles, addAlpha } from '../theme/theme';

import { format, isAfter } from 'date-fns';
import { exportObjective, saveObjectiveToDevice } from '../utils/objectiveExport';
import React, { useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';


import { ConfirmModal } from './ConfirmModal';


interface ObjectiveCardProps {
  objective: Objective;
  mode?: 'full' | 'grid' | 'minimal';
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, mode = 'full' }) => {
  const router = useRouter();
  const { getActiveTheme } = useSettingsStore();
  const { getAllCategories } = useCategoryStore();
  const { todos, deleteObjective } = useObjectiveStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const swipeableRef = useRef<Swipeable>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);




  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

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

  const handleExport = async (mode: 'share' | 'save') => {
    setIsChoiceModalVisible(false);

    setIsExporting(true);
    swipeableRef.current?.close();
    
    try {
      if (mode === 'save') {
        const saved = await saveObjectiveToDevice(objective, todos.filter(t => t.objectiveId === objective.id));
        if (saved) {
          Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('exportSaved'),
          });
        }
      } else {
        await exportObjective(objective, todos.filter(t => t.objectiveId === objective.id));
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: t('exportShared'),
        });
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('exportFailed'),
      });
    } finally {
      setIsExporting(false);
    }
  };


  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    setIsDeleteModalVisible(false);
    swipeableRef.current?.close();
    deleteObjective(objective.id);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scaleExport = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
      extrapolate: 'clamp',
    });
    const scaleDelete = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionsContainer}>
        <Animated.View style={[styles.actionBtnWrapper, { opacity, transform: [{ scale: scaleExport }] }]}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsChoiceModalVisible(true);
            }} 
            style={[styles.actionBtn, { backgroundColor: theme.colors.done }]}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <MaterialCommunityIcons name="share-variant" size={24} color={theme.colors.cardStart} />
            )}
          </TouchableOpacity>

        </Animated.View>
        <Animated.View style={[styles.actionBtnWrapper, { opacity, transform: [{ scale: scaleDelete }] }]}>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={[styles.actionBtn, { backgroundColor: theme.colors.pending }]}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.colors.cardStart} />
          </TouchableOpacity>

        </Animated.View>
      </View>
    );
  };

  if (mode === 'minimal') {
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/objective/${objective.id}`)}
          style={styles.minimalContainer}
        >
          <LinearGradient
            colors={[theme.colors.cardStart, theme.colors.cardEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.minimalGradient}
          >
            <MaterialCommunityIcons name={category.icon as any} size={20} color={category.color} />
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={[globalStyles.subHeading, { fontSize: 14 }]} numberOfLines={1}>{objective.name}</Text>
              <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255, 255, 255, 0.05)', marginTop: 4, height: 4 }]}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.colors.done }]} />
              </View>
            </View>
            <Text style={[globalStyles.text, { fontSize: 12, color: theme.colors.text, opacity: 0.6 }]}>{Math.round(progress)}%</Text>

          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (mode === 'grid') {
    return (
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/objective/${objective.id}`)}
          style={styles.gridContainer}
        >
          <LinearGradient
            colors={[theme.colors.cardStart, theme.colors.cardEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gridGradient}
          >
            <Text style={[globalStyles.subHeading, styles.gridTitle]} numberOfLines={2}>{objective.name}</Text>
            
            <View style={styles.gridCenter}>
              <View style={[styles.gridIconLarge, { backgroundColor: `${category.color}15` }]}>
                <MaterialCommunityIcons name={category.icon as any} size={32} color={category.color} />
              </View>
            </View>

            <View style={styles.gridBottom}>
              <View style={[styles.gridProgressRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.gridProgressText, { color: theme.colors.text }]}>{t('progress')}</Text>
                <Text style={[styles.gridProgressText, { color: theme.colors.text }]}>{Math.round(progress)}%</Text>


              </View>
              <View style={[styles.progressBarBg, { backgroundColor: addAlpha(theme.colors.text, '10'), height: 4 }]}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.colors.done }]} />
              </View>

            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      rightThreshold={40}
    >
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/objective/${objective.id}`)}
        >
          <LinearGradient
            colors={[theme.colors.cardStart, theme.colors.cardEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[globalStyles.card, { marginBottom: 0 }]}
          >
            <View style={styles.header}>
              <Text style={[globalStyles.subHeading, { flex: 1 }]}>{objective.name}</Text>
              <View style={[styles.badge, { backgroundColor: `${category.color}20` }]}>
                <MaterialCommunityIcons name={category.icon as any} size={16} color={category.color} />
                <Text style={[styles.badgeText, { color: category.color }]}>{category.name}</Text>
              </View>
            </View>

            <Text style={[globalStyles.text, styles.dateText]}>
              {t('started')}: {format(new Date(objective.createdAt), 'MMM d, yyyy')}
            </Text>

            <View style={styles.progressContainer}>
              <View style={[styles.progressHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={globalStyles.text}>{t('progress')}</Text>
                <Text style={[globalStyles.text, { fontFamily: 'Syne_600SemiBold' }]}>{Math.round(progress)}%</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.colors.done }]} />
              </View>
            </View>

            {nextMilestone && (
              <View style={styles.milestoneContainer}>
                <MaterialCommunityIcons name="flag-triangle" size={16} color={theme.colors.pending} />
                <Text style={[globalStyles.text, styles.milestoneText]}>
                  {t('next')}: {nextMilestone.name} ({format(new Date(nextMilestone.endDate!), 'MMM d')})
                </Text>
              </View>
            )}


          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      <ConfirmModal
        visible={isDeleteModalVisible}
        title={t('deleteObjective')}
        message={t('deleteObjectiveMsg')}
        confirmText={t('delete')}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        type="danger"
        icon="trash-can-outline"
      />

      <Modal visible={isChoiceModalVisible} transparent animationType="fade" onRequestClose={() => setIsChoiceModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsChoiceModalVisible(false)}>
          <View style={[styles.choiceContainer, { backgroundColor: theme.colors.backgroundMain }]}>
             <View style={styles.choiceHeader}>
                <View style={[styles.choiceIconBg, { backgroundColor: addAlpha(theme.colors.done, '15') }]}>
                  <MaterialCommunityIcons name="folder-zip-outline" size={32} color={theme.colors.done} />
                </View>

                <Text style={[globalStyles.subHeading, { marginTop: 16, textAlign: 'center' }]}>{t('selectExportMode')}</Text>
                <Text style={[globalStyles.text, { opacity: 0.6, marginTop: 4, textAlign: 'center' }]}>{objective.name}</Text>
             </View>

             <View style={styles.choiceButtons}>
                <TouchableOpacity 
                  style={[styles.choiceBtn, { backgroundColor: theme.colors.done }]} 
                  onPress={() => handleExport('save')}
                >
                  <MaterialCommunityIcons name="content-save-outline" size={20} color={theme.colors.backgroundMain} />
                  <Text style={[styles.choiceBtnText, { color: theme.colors.backgroundMain }]}>{t('saveToDevice')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.choiceBtn, { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]} 
                  onPress={() => handleExport('share')}
                >
                  <MaterialCommunityIcons name="share-variant" size={20} color={theme.colors.text} />
                  <Text style={[styles.choiceBtnText, { color: theme.colors.text }]}>{t('shareZip')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.choiceCancelBtn} 
                  onPress={() => setIsChoiceModalVisible(false)}
                >
                  <Text style={[styles.choiceBtnText, { color: theme.colors.text, opacity: 0.5 }]}>{t('cancel')}</Text>
                </TouchableOpacity>
             </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </Swipeable>

  );
};

const styles = StyleSheet.create({
  rightActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 8,
    width: 160,
  },
  actionBtnWrapper: {
    flex: 1,
    paddingVertical: 2, // Space from card edges
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  cardContainer: {
    marginBottom: 16,
  },
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
  minimalContainer: {
    marginBottom: 12,
  },
  minimalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridContainer: {
    flex: 1,
    marginBottom: 16,
  },
  gridGradient: {
    aspectRatio: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Syne_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  gridCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBottom: {
    marginTop: 8,
  },
  gridProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridProgressText: {
    fontSize: 10,
    opacity: 0.6,
    fontFamily: 'DMSans_400Regular',
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  choiceContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  choiceHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  choiceIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceButtons: {
    gap: 12,
  },
  choiceBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  choiceBtnText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 15,
  },
  choiceCancelBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
});

