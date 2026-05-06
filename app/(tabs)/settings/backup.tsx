import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useObjectiveStore } from '../../../store/useObjectiveStore';
import { getGlobalStyles } from '../../../theme/theme';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslations } from '../../../hooks/useTranslations';

export default function BackupScreen() {
  const { getActiveTheme } = useSettingsStore();
  const { objectives, todos, importTodos } = useObjectiveStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const handleExport = async () => {
    try {
      const data = { objectives, todos };
      // @ts-ignore - Expo types issue in current SDK version
      const fileUri = `${FileSystem.documentDirectory}hadaf_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      Alert.alert(t('success'), `${t('backupSaved')} ${fileUri}`);
    } catch (e) {
      Alert.alert(t('error'), t('exportFailed'));
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', 'text/csv'] });
      if (result.canceled) return;
      
      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsed = JSON.parse(content);
      
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.objectives && parsed.todos) {
        useObjectiveStore.setState({ objectives: parsed.objectives, todos: parsed.todos });
        Alert.alert(t('success'), t('fullBackupRestored'));
      } else if (Array.isArray(parsed)) {
        importTodos(parsed);
        Alert.alert(t('success'), t('todosImported'));
      } else {
        Alert.alert(t('invalidFormat'), t('invalidFormat'));
      }
    } catch (e) {
      Alert.alert(t('error'), t('importFailed'));
    }
  };

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={t('backup')} showBack />
      <View style={styles.content}>
        
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: theme.colors.cardStart, flexDirection: isRTL ? 'row-reverse' : 'row' }]} 
          onPress={handleExport}
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
