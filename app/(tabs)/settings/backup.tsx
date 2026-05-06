import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useObjectiveStore } from '../../../store/useObjectiveStore';
import { Objective, Todo } from '../../../store/types';
import { getGlobalStyles } from '../../../theme/theme';

import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslations } from '../../../hooks/useTranslations';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { generateFullBackupZip, parseFullImport, confirmFullImport } from '../../../utils/objectiveExport';
import { useState } from 'react';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';




export default function BackupScreen() {
  const { getActiveTheme } = useSettingsStore();
  const { objectives, todos, importTodos } = useObjectiveStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const [modalConfig, setModalConfig] = useState<{ 
    visible: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'danger' | 'warning'; 
    icon: any;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);



  const handleExport = async (mode: 'share' | 'save') => {
    setModalConfig(null);
    try {
      const zipUri = await generateFullBackupZip(objectives, todos);
      
      if (mode === 'save') {
        if (Platform.OS === 'android') {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(zipUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const fileName = `hadaf_full_backup_${Date.now()}.zip`;
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              'application/zip'
            );
            await FileSystem.writeAsStringAsync(fileUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Toast.show({ 
              type: 'success', 
              text1: t('success'), 
              text2: t('exportSaved') 
            });
          }
        } else {
          // iOS "Save to Files" via Share Sheet
          await Sharing.shareAsync(zipUri);
        }
      } else {
        await Sharing.shareAsync(zipUri);
      }
      
      // Cleanup cache
      await FileSystem.deleteAsync(zipUri, { idempotent: true });
    } catch (e) {
      Toast.show({ type: 'error', text1: t('error'), text2: t('exportFailed') });
    }
  };




  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: ['application/zip', 'application/json'] 
      });
      if (result.canceled) return;
      
      const file = result.assets[0];
      
      if (file.name.endsWith('.zip')) {
        const fullData = await parseFullImport(file.uri);
        setModalConfig({
          visible: true,
          title: t('importPreview'),
          message: `${fullData.objectives.length} ${t('objectives')}, ${fullData.todos.length} ${t('objectiveTodos')}`,
          type: 'info',
          icon: 'zip-box',
          confirmText: t('importConfirm'),
          onConfirm: async () => {
            setModalConfig(null);
            await confirmFullImport(fullData, file.uri, objectives, (objs: Objective[], ts: Todo[]) => {
              useObjectiveStore.getState().appendBackup(objs, ts);
            });
            Toast.show({ type: 'success', text1: t('success'), text2: t('importSuccess') });
          }

        });
      } else {
        // Old JSON logic (Fallback)
        const content = await FileSystem.readAsStringAsync(file.uri);
        const parsed = JSON.parse(content);
        if (parsed?.objectives && parsed?.todos) {
          useObjectiveStore.getState().appendBackup(parsed.objectives, parsed.todos);
          Toast.show({ type: 'success', text1: t('success'), text2: t('importSuccess') });
        }
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: t('error'), text2: t('importFailed') });
    }
  };

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={t('backup')} showBack />
      <View style={styles.content}>
        
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: theme.colors.cardStart, flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
          onPress={() => setModalConfig({
            visible: true,
            title: t('selectExportMode'),
            message: t('exportDesc'),
            type: 'info',
            icon: 'export',
            confirmText: t('saveToDevice'),
            cancelText: t('shareZip'),
            onConfirm: () => handleExport('save'),
            onCancel: () => handleExport('share')
          })}

        >

          <View style={[styles.btnIcon, isRTL ? { marginLeft: 0, marginRight: 16 } : { marginRight: 16 }]}>
            <MaterialCommunityIcons name="export" size={24} color={theme.colors.done} />
          </View>
          <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={[globalStyles.subHeading, { fontSize: 16 }]}>{t('exportData')}</Text>
            <Text style={[globalStyles.text, { fontSize: 12, opacity: 0.7, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('exportDesc')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: theme.colors.cardStart, flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
          onPress={handleImport}
        >
          <View style={[styles.btnIcon, isRTL ? { marginLeft: 0, marginRight: 16 } : { marginRight: 16 }]}>
            <MaterialCommunityIcons name="import" size={24} color={theme.colors.inProgress} />
          </View>
          <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={[globalStyles.subHeading, { fontSize: 16 }]}>{t('importData')}</Text>
            <Text style={[globalStyles.text, { fontSize: 12, opacity: 0.7, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('importDesc')}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.formatExample}>
          <Text style={[globalStyles.text, { fontSize: 12, color: theme.colors.pending, marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('importFormat')}:
          </Text>
          <Text style={[globalStyles.text, { fontSize: 11, fontFamily: 'monospace', opacity: 0.8, textAlign: 'left' }]}>
            {`[\n  {\n    "name": "Design wireframes",\n    "status": "pending",\n    "startDate": "2025-06-01",\n    "endDate": "2025-06-07"\n  }\n]`}
          </Text>
        </View>
      </View>
      {modalConfig ? (
        <ConfirmModal
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm || (() => setModalConfig(null))}
          onCancel={modalConfig.onCancel || (() => setModalConfig(null))}
          type={modalConfig.type}
          icon={modalConfig.icon}
          confirmText={modalConfig.confirmText || "OK"}
          cancelText={modalConfig.cancelText}
        />

      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  btn: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnIcon: {
    // Handled by dynamic style
  },
  formatExample: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
