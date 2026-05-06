import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore, defaultThemes } from '../../../store/useSettingsStore';
import { getGlobalStyles } from '../../../theme/theme';
import { ThemeColors } from '../../../store/types';
import { useTranslations } from '../../../hooks/useTranslations';

const { width } = Dimensions.get('window');

const PRESET_COLORS = [
  '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', 
  '#10b981', '#06b6d4', '#f43f5e', '#f97316',
  '#ec4899', '#64748b', '#000000', '#ffffff'
];


const THEME_ICONS: Record<string, string> = {
  midnight: 'moon-waning-crescent',
  nebula: 'flash',
  aurora: 'pine-tree',
  cosmic: 'auto-fix',
};

export default function ThemeScreen() {
  const { activeThemeId, setTheme, getActiveTheme, setCustomColor, resetCustomColors } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const [activeColorPicker, setActiveColorPicker] = useState<keyof Pick<ThemeColors, 'done' | 'inProgress' | 'pending'> | null>(null);

  const availableThemes = defaultThemes.map(t => ({
    id: t.id,
    name: t.name,
    primary: t.colors.backgroundMain,
    secondary: t.colors.cardStart,
    accent: t.colors.accent,
    cardEnd: t.colors.cardEnd,
  }));

  return (
    <View style={[globalStyles.container, { backgroundColor: theme.colors.backgroundMain }]}>
      <GlobalHeader title={t('theme')} showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Themes Grid */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.sectionLabel}>{t('themes')}</Text>
            <View style={[styles.headerLine, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </View>
          
          <View style={[styles.grid, isRTL && { flexDirection: 'row-reverse' }]}>
            {availableThemes.map((t) => {
              const isActive = activeThemeId === t.id;
              const iconName = THEME_ICONS[t.id] || 'palette';
              
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTheme(t.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.themeCard,
                    { borderColor: isActive ? t.accent : 'rgba(255,255,255,0.05)' }
                  ]}
                >
                  <LinearGradient
                    colors={[t.secondary, t.cardEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.themeGradient}
                  >
                    <View style={[styles.themeTop, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                        <MaterialCommunityIcons 
                          name={iconName as any} 
                          size={16} 
                          color={isActive ? '#fff' : 'rgba(255,255,255,0.4)'} 
                        />
                      </View>
                      {isActive && (
                        <View style={styles.checkCircle}>
                          <MaterialCommunityIcons name="check" size={10} color="#000" strokeWidth={4} />
                        </View>
                      )}
                    </View>

                    {/* Integrated Skeleton */}
                    <View style={styles.skeleton}>
                      <View style={[styles.skeletonLine, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                        <View 
                          style={[
                            styles.skeletonProgress, 
                            { 
                              width: isActive ? '70%' : '30%',
                              backgroundColor: 'rgba(255,255,255,0.15)',
                              alignSelf: isRTL ? 'flex-end' : 'flex-start'
                            }
                          ]} 
                        />
                      </View>
                      <View style={[styles.skeletonShort, { backgroundColor: 'rgba(255,255,255,0.04)', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} />
                    </View>

                    <Text style={[styles.themeName, { color: 'rgba(255,255,255,0.9)', textAlign: isRTL ? 'right' : 'left' }]}>{t.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Status Colors */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.sectionLabel}>{t('status')}</Text>
            <TouchableOpacity onPress={resetCustomColors} style={styles.resetBtn}>
              <MaterialCommunityIcons name="refresh" size={14} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>

          <View style={styles.statusList}>
            {[
              { label: t('done'), key: 'done' as const },
              { label: t('inProgress'), key: 'inProgress' as const },
              { label: t('pending'), key: 'pending' as const }
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setActiveColorPicker(item.key)}
                style={[
                  styles.statusRow,
                  { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}
              >
                <View style={[styles.statusLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View 
                    style={[
                      styles.statusIndicator, 
                      { 
                        backgroundColor: theme.colors[item.key],
                        shadowColor: theme.colors[item.key],
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        elevation: 4
                      }
                    ]} 
                  />
                  <Text style={[globalStyles.text, styles.statusLabel]}>{item.label}</Text>
                </View>
                <View style={[styles.statusRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.hexCode}>{theme.colors[item.key].toUpperCase()}</Text>
                  <MaterialCommunityIcons name={isRTL ? "chevron-left" : "chevron-right"} size={14} color="rgba(255,255,255,0.1)" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Mini Picker Modal */}
      <Modal visible={!!activeColorPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardStart, borderColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.modalTitle}>{t(activeColorPicker === 'done' ? 'done' : activeColorPicker === 'inProgress' ? 'inProgress' : 'pending').toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setActiveColorPicker(null)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.colorGrid, isRTL && { flexDirection: 'row-reverse' }]}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    if (activeColorPicker) {
                      setCustomColor(activeColorPicker, color);
                      setActiveColorPicker(null);
                    }
                  }}
                  style={[styles.colorOption, { backgroundColor: color }]}
                >
                  {activeColorPicker && theme.colors[activeColorPicker] === color && (
                    <View style={styles.optionChecked}>
                      <MaterialCommunityIcons name="check" size={14} color="#fff" strokeWidth={4} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.2)',
  },
  headerLine: {
    flex: 1,
    height: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: (width - 52) / 2,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeGradient: {
    padding: 14,
    height: 110,
    justifyContent: 'space-between',
  },
  themeTop: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    gap: 6,
    marginTop: 4,
  },
  skeletonLine: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  skeletonProgress: {
    height: '100%',
  },
  skeletonShort: {
    height: 4,
    width: '50%',
    borderRadius: 2,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Syne_600SemiBold',
  },
  resetBtn: {
    padding: 4,
  },
  statusList: {
    gap: 10,
  },
  statusRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusLeft: {
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  statusRight: {
    alignItems: 'center',
    gap: 12,
  },
  hexCode: {
    fontSize: 9,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  optionChecked: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
