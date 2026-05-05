import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useObjectiveStore } from '../../../store/useObjectiveStore';
import { getGlobalStyles } from '../../../theme/theme';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BackupScreen() {
  const { getActiveTheme } = useSettingsStore();
  const { objectives, todos, importTodos } = useObjectiveStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const handleExport = async () => {
    try {
      const data = { objectives, todos };
      // @ts-ignore - Expo types issue in current SDK version
      const fileUri = `${FileSystem.documentDirectory}hadaf_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      Alert.alert('Success', `Backup saved to ${fileUri}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to export backup');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', 'text/csv'] });
      if (result.canceled) return;
      
      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsed = JSON.parse(content);
      
      // Basic validation and import
      if (Array.isArray(parsed)) {
        importTodos(parsed);
        Alert.alert('Success', 'Todos imported successfully!');
      } else {
        Alert.alert('Invalid Format', 'The file does not match the required format.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to read file or file is not valid JSON.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="Backup & Data" showBack />
      <View style={styles.content}>
        
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.cardStart }]} onPress={handleExport}>
          <View style={styles.btnIcon}>
            <MaterialCommunityIcons name="export" size={24} color={theme.colors.done} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[globalStyles.subHeading, { fontSize: 16 }]}>Export Data</Text>
            <Text style={[globalStyles.text, { fontSize: 12, opacity: 0.7 }]}>Save your objectives and todos to a file</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.cardStart }]} onPress={handleImport}>
          <View style={styles.btnIcon}>
            <MaterialCommunityIcons name="import" size={24} color={theme.colors.inProgress} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[globalStyles.subHeading, { fontSize: 16 }]}>Import Data</Text>
            <Text style={[globalStyles.text, { fontSize: 12, opacity: 0.7 }]}>Load a JSON backup file</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.formatExample}>
          <Text style={[globalStyles.text, { fontSize: 12, color: theme.colors.pending, marginBottom: 8 }]}>JSON Import Format Example:</Text>
          <Text style={[globalStyles.text, { fontSize: 11, fontFamily: 'monospace', opacity: 0.8 }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnIcon: {
    marginRight: 16,
  },
  formatExample: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
