import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NotificationConfig, RepeatConfig } from '../store/types';
import { getGlobalStyles } from '../theme/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (config: NotificationConfig) => void;
  initialConfig?: NotificationConfig;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onSave,
  initialConfig,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const [isActive, setIsActive] = useState(initialConfig?.isActive ?? false);
  const [date, setDate] = useState<Date>(
    initialConfig?.datetime ? new Date(initialConfig.datetime) : new Date()
  );
  const [repeat, setRepeat] = useState<RepeatConfig>(initialConfig?.repeat ?? 'none');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  useEffect(() => {
    if (visible) {
      setIsActive(initialConfig?.isActive ?? false);
      setDate(initialConfig?.datetime ? new Date(initialConfig.datetime) : new Date());
      setRepeat(initialConfig?.repeat ?? 'none');
    }
  }, [visible, initialConfig]);

  const handleSave = () => {
    onSave({
      isActive,
      datetime: date.toISOString(),
      repeat,
      daysOfWeek: initialConfig?.daysOfWeek || [],
    });
    onClose();
  };

  const showMode = (currentMode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        onChange: (event, selectedDate) => {
          if (selectedDate) setDate(selectedDate);
        },
        mode: currentMode,
        is24Hour: true,
      });
    } else {
      setShowPicker(true);
      setPickerMode(currentMode);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.backgroundMain }]}>
          <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[globalStyles.subHeading, { fontSize: 18 }]}>{t('notificationSettings')}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={globalStyles.text}>{t('enableNotification')}</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#3f3f46', true: theme.colors.done }}
            />
          </View>

          {isActive && (
            <>
              <Text style={[globalStyles.text, styles.label, isRTL && { textAlign: 'right' }]}>{t('dateTime')}</Text>
              <View style={[styles.datePickerContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.colors.cardStart }]} onPress={() => showMode('date')}>
                  <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.text} />
                  <Text style={[globalStyles.text, { marginLeft: 8 }]}>{format(date, 'MMM d, yyyy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.colors.cardStart }]} onPress={() => showMode('time')}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.text} />
                  <Text style={[globalStyles.text, { marginLeft: 8 }]}>{format(date, 'hh:mm a')}</Text>
                </TouchableOpacity>
              </View>

              {Platform.OS === 'ios' && showPicker && (
                <DateTimePicker
                  value={date}
                  mode={pickerMode}
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}

              <Text style={[globalStyles.text, styles.label, isRTL && { textAlign: 'right' }]}>{t('repeat')}</Text>
              <View style={[styles.repeatContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                {(['none', 'daily', 'weekly'] as RepeatConfig[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.repeatBtn,
                      { backgroundColor: theme.colors.cardStart },
                      repeat === r && { borderColor: theme.colors.text, borderWidth: 1 },
                    ]}
                    onPress={() => setRepeat(r)}
                  >
                    <Text style={[globalStyles.text, { textTransform: 'capitalize', fontSize: 14 }]}>
                      {t(r as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.done }]}
            onPress={handleSave}
          >
            <Text style={[globalStyles.text, styles.saveText]}>{t('saveConfig')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    opacity: 0.7,
    marginBottom: 8,
    marginTop: 16,
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  repeatContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  repeatBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
