import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useObjectiveStore } from '../../store/useObjectiveStore';
import { getGlobalStyles } from '../../theme/theme';
import { GlobalHeader } from '../../components/GlobalHeader';
import { PresentationSwitcher, PresentationMode } from '../../components/PresentationSwitcher';
import { FilterBar } from '../../components/FilterBar';
import { ObjectiveCard } from '../../components/ObjectiveCard';

export default function HomeScreen() {
  const { getActiveTheme } = useSettingsStore();
  const { objectives, addObjective } = useObjectiveStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const [activeMode, setActiveMode] = useState<PresentationMode>('cards');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('start');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newObjectiveName, setNewObjectiveName] = useState('');

  const handleCreateObjective = () => {
    if (newObjectiveName.trim()) {
      addObjective(newObjectiveName, 'default');
      setNewObjectiveName('');
      setIsModalVisible(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title="Hadaf" showSettings />
      <PresentationSwitcher activeMode={activeMode} onModeChange={setActiveMode} />
      <FilterBar
        filterOptions={[{ id: 'all', label: 'All Categories' }]}
        sortOptions={[{ id: 'start', label: 'Start Date' }]}
        activeFilter={activeFilter}
        activeSort={activeSort}
        onFilterSelect={setActiveFilter}
        onSortSelect={setActiveSort}
      />
      <FlatList
        data={objectives}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ObjectiveCard objective={item} />}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.text }]}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color={theme.colors.backgroundMain} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}
          >
            <View style={styles.modalHeader}>
              <Text style={globalStyles.subHeading}>New Objective</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
              placeholder="What do you want to achieve?"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newObjectiveName}
              onChangeText={setNewObjectiveName}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
              onPress={handleCreateObjective}
            >
              <Text style={[styles.createBtnText, { color: theme.colors.backgroundMain }]}>Create Objective</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  createBtn: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
  },
});
