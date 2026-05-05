import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useObjectiveStore } from '../../store/useObjectiveStore';
import { getGlobalStyles } from '../../theme/theme';
import { GlobalHeader } from '../../components/GlobalHeader';
import { TodoCard } from '../../components/TodoCard';
import { FilterBar } from '../../components/FilterBar';

type Tab = 'todos' | 'kanban' | 'archived';

export default function ObjectiveScreen() {
  const { id } = useLocalSearchParams();
  const { getActiveTheme } = useSettingsStore();
  const { objectives, todos, updateTodo, archiveTodo, deleteTodo, addTodo } = useObjectiveStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const [activeTab, setActiveTab] = useState<Tab>('todos');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('start');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTodoName, setNewTodoName] = useState('');

  const handleCreateTodo = () => {
    if (newTodoName.trim() && typeof id === 'string') {
      addTodo(id, {
        name: newTodoName,
        status: 'pending',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      });
      setNewTodoName('');
      setIsModalVisible(false);
    }
  };

  const objective = objectives.find((o) => o.id === id);
  const objectiveTodos = todos.filter((t) => t.objectiveId === id);

  const activeTodos = objectiveTodos.filter((t) => !t.isArchived);
  const archivedTodos = objectiveTodos.filter((t) => t.isArchived);

  if (!objective) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.text}>Objective not found</Text>
      </View>
    );
  }

  const renderTodos = () => {
    return (
      <FlatList
        data={activeTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoCard
            item={item}
            drag={() => { }}
            isActive={false}
            onStatusChange={(tid, status) => updateTodo(tid, { status })}
            onArchive={(tid) => archiveTodo(tid)}
            onDelete={(tid) => deleteTodo(tid)}
            onNotify={() => { }}
          />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      />
    );
  };

  const renderKanban = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={globalStyles.text}>Kanban / Time Grid View</Text>
      </View>
    );
  };

  const renderArchived = () => {
    return (
      <FlatList
        data={archivedTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ opacity: 0.6 }}>
            <TodoCard
              item={item}
              drag={() => { }}
              isActive={false}
              onStatusChange={(tid, status) => updateTodo(tid, { status })}
              onArchive={(tid) => archiveTodo(tid)}
              onDelete={(tid) => deleteTodo(tid)}
              onNotify={() => { }}
            />
          </View>
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      />
    );
  };

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={objective.name} showBack />

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'todos' && { borderBottomColor: theme.colors.text }]} onPress={() => setActiveTab('todos')}>
          <Text style={[styles.tabText, { color: theme.colors.text, opacity: activeTab === 'todos' ? 1 : 0.5 }]}>To-Dos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'kanban' && { borderBottomColor: theme.colors.text }]} onPress={() => setActiveTab('kanban')}>
          <Text style={[styles.tabText, { color: theme.colors.text, opacity: activeTab === 'kanban' ? 1 : 0.5 }]}>Kanban / Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'archived' && { borderBottomColor: theme.colors.text }]} onPress={() => setActiveTab('archived')}>
          <Text style={[styles.tabText, { color: theme.colors.text, opacity: activeTab === 'archived' ? 1 : 0.5 }]}>Archived</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'todos' && (
        <FilterBar
          filterOptions={[{ id: 'all', label: 'All Status' }]}
          sortOptions={[{ id: 'start', label: 'Start Date' }]}
          activeFilter={activeFilter}
          activeSort={activeSort}
          onFilterSelect={setActiveFilter}
          onSortSelect={setActiveSort}
        />
      )}

      {activeTab === 'todos' && renderTodos()}
      {activeTab === 'kanban' && renderKanban()}
      {activeTab === 'archived' && renderArchived()}

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
              <Text style={globalStyles.subHeading}>New To-Do</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
              placeholder="What needs to be done?"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newTodoName}
              onChangeText={setNewTodoName}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
              onPress={handleCreateTodo}
            >
              <Text style={[styles.createBtnText, { color: theme.colors.backgroundMain }]}>Add To-Do</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 14,
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
