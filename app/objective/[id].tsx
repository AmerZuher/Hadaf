import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useObjectiveStore } from '../../store/useObjectiveStore';
import { getGlobalStyles } from '../../theme/theme';
import { GlobalHeader } from '../../components/GlobalHeader';
import { TodoCard } from '../../components/TodoCard';
import { FilterBar } from '../../components/FilterBar';
import { NotificationModal } from '../../components/NotificationModal';
import { scheduleTodoNotification, cancelNotification } from '../../utils/notifications';
import { NotificationConfig, Status } from '../../store/types';
import Toast from 'react-native-toast-message';
import { todoSchema, TodoFormData } from '../../utils/validation';

type Tab = 'todos' | 'kanban' | 'archived';

const ObjectiveScreen = () => {
  const { id } = useLocalSearchParams();
  const { getActiveTheme } = useSettingsStore();
  const { objectives, todos, updateTodo, archiveTodo, restoreTodo, deleteTodo, addTodo } = useObjectiveStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const [activeTab, setActiveTab] = useState<Tab>('todos');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('start_desc');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<TodoFormData>({ name: '', location: '', notes: '', startDate: new Date().toISOString(), endDate: new Date().toISOString() });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TodoFormData, string>>>({});
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const handleOpenNotification = (todoId: string) => {
    setSelectedTodoId(todoId);
    setIsNotificationModalVisible(true);
  };

  const handleSaveNotification = async (config: NotificationConfig) => {
    if (!selectedTodoId) return;
    const todo = todos.find((t) => t.id === selectedTodoId);
    if (!todo) return;

    let finalConfig = { ...config };

    if (!finalConfig.isActive && todo.notificationConfig?.notificationId) {
      await cancelNotification(todo.notificationConfig.notificationId);
      finalConfig.notificationId = undefined;
    } else if (finalConfig.isActive) {
      const identifier = await scheduleTodoNotification(todo.name, finalConfig);
      finalConfig.notificationId = identifier;
    }

    updateTodo(selectedTodoId, { notificationConfig: finalConfig });
    setIsNotificationModalVisible(false);
    setSelectedTodoId(null);
  };

  const handleOpenCreateModal = () => {
    setEditingTodoId(null);
    setFormData({ name: '', location: '', notes: '', startDate: new Date().toISOString(), endDate: new Date().toISOString() });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      setEditingTodoId(todoId);
      setFormData({
        name: todo.name,
        location: todo.location || '',
        notes: todo.notes || '',
        startDate: todo.startDate || new Date().toISOString(),
        endDate: todo.endDate || new Date().toISOString(),
      });
      setFormErrors({});
      setIsModalVisible(true);
    }
  };

  const handleSaveTodo = () => {
    const result = todoSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    const validData = result.data;
    if (typeof id !== 'string') return;

    const objectiveTodosCheck = todos.filter((t) => t.objectiveId === id);
    const isDuplicate = objectiveTodosCheck.some(
      (t) => t.name.toLowerCase() === validData.name.trim().toLowerCase() && t.id !== editingTodoId
    );

    if (isDuplicate) {
      Toast.show({
        type: 'error',
        text1: 'Duplicate Task',
        text2: 'A task with this name already exists.',
      });
      return;
    }

    if (editingTodoId) {
      updateTodo(editingTodoId, { 
        name: validData.name.trim(),
        location: validData.location?.trim() || undefined,
        notes: validData.notes?.trim() || undefined,
        startDate: validData.startDate,
        endDate: validData.endDate,
      });
    } else {
      addTodo(id, {
        name: validData.name.trim(),
        location: validData.location?.trim() || undefined,
        notes: validData.notes?.trim() || undefined,
        status: 'pending',
        startDate: validData.startDate || new Date().toISOString(),
        endDate: validData.endDate || new Date().toISOString(),
      });
    }
    
    setFormData({ name: '', location: '', notes: '', startDate: new Date().toISOString(), endDate: new Date().toISOString() });
    setFormErrors({});
    setIsModalVisible(false);
    setEditingTodoId(null);
  };

  const objective = objectives.find((o) => o.id === id);
  const objectiveTodos = todos.filter((t) => t.objectiveId === id);

  const activeTodos = objectiveTodos.filter((t) => !t.isArchived);
  const archivedTodos = objectiveTodos.filter((t) => t.isArchived);

  // Apply filtering and sorting
  let displayedTodos = [...activeTodos];
  if (activeFilter !== 'all') {
    displayedTodos = displayedTodos.filter(t => t.status === activeFilter);
  }
  
  displayedTodos.sort((a, b) => {
    if (activeSort === 'name') {
      return a.name.localeCompare(b.name);
    } else if (activeSort === 'start_asc') {
      return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
    } else {
      // start_desc
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    }
  });

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
        key="todos-cards"
        data={displayedTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoCard
            item={item}
            drag={() => { }}
            isActive={false}
            onStatusChange={(tid, status) => updateTodo(tid, { status })}
            onArchive={(tid) => archiveTodo(tid)}
            onDelete={(tid) => deleteTodo(tid)}
            onNotify={() => handleOpenNotification(item.id)}
            onEdit={() => handleOpenEditModal(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      />
    );
  };

  const renderKanban = () => {
    const statuses: { id: Status; label: string; color: string }[] = [
      { id: 'pending', label: 'Pending', color: theme.colors.pending },
      { id: 'in-progress', label: 'In Progress', color: theme.colors.inProgress },
      { id: 'done', label: 'Done', color: theme.colors.done },
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanContainer}>
        {statuses.map((column) => {
          const columnTodos = displayedTodos.filter((t) => t.status === column.id);
          return (
            <View key={column.id} style={styles.kanbanColumn}>
              <View style={styles.columnHeader}>
                <View style={[styles.columnIndicator, { backgroundColor: column.color }]} />
                <Text style={[globalStyles.subHeading, { fontSize: 16 }]}>{column.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <Text style={[globalStyles.text, { fontSize: 12, opacity: 0.8 }]}>{columnTodos.length}</Text>
                </View>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {columnTodos.map((item) => (
                  <View key={item.id} style={{ width: '100%', marginBottom: 12 }}>
                    <TodoCard
                      item={item}
                      drag={() => { }}
                      isActive={false}
                      onStatusChange={(tid, status) => updateTodo(tid, { status })}
                      onArchive={(tid) => archiveTodo(tid)}
                      onDelete={(tid) => deleteTodo(tid)}
                      onNotify={() => handleOpenNotification(item.id)}
                      onEdit={() => handleOpenEditModal(item.id)}
                      isCompact
                      isReadOnly
                    />
                  </View>
                ))}
                {columnTodos.length === 0 && (
                  <View style={styles.emptyColumn}>
                    <MaterialCommunityIcons name="tray" size={32} color={theme.colors.text} style={{ opacity: 0.1 }} />
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
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
              onArchive={(tid) => restoreTodo(tid)}
              onDelete={(tid) => deleteTodo(tid)}
              onNotify={() => handleOpenNotification(item.id)}
              onEdit={() => handleOpenEditModal(item.id)}
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
          <Text style={[styles.tabText, { color: theme.colors.text, opacity: activeTab === 'kanban' ? 1 : 0.5 }]}>Kanban</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'archived' && { borderBottomColor: theme.colors.text }]} onPress={() => setActiveTab('archived')}>
          <Text style={[styles.tabText, { color: theme.colors.text, opacity: activeTab === 'archived' ? 1 : 0.5 }]}>Archived</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'todos' && (
        <FilterBar
          filterOptions={[
            { id: 'all', label: 'All Statuses' },
            { id: 'pending', label: 'Pending' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'done', label: 'Done' }
          ]}
          sortOptions={[
            { id: 'start_desc', label: 'Newest First' },
            { id: 'start_asc', label: 'Oldest First' },
            { id: 'name', label: 'Name (A-Z)' }
          ]}
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
        onPress={handleOpenCreateModal}
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
              <Text style={globalStyles.subHeading}>{editingTodoId ? 'Edit To-Do' : 'New To-Do'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: '80%' }}>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError, { color: theme.colors.text, borderColor: formErrors.name ? theme.colors.pending : 'rgba(255,255,255,0.1)' }]}
                placeholder="What needs to be done?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                }}
                autoFocus
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

              <View style={styles.dateRow}>
                <TouchableOpacity 
                  style={[styles.dateInput, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }]}
                  onPress={() => {
                    if (Platform.OS === 'android') {
                      DateTimePickerAndroid.open({
                        value: new Date(formData.startDate || Date.now()),
                        onChange: (event, date) => {
                          if (event.type === 'set' && date) setFormData({ ...formData, startDate: date.toISOString() });
                        },
                        mode: 'date',
                      });
                    } else {
                      setShowStartDatePicker(true);
                    }
                  }}
                >
                  <MaterialCommunityIcons name="calendar-start" size={20} color={theme.colors.text} style={{ opacity: 0.7 }} />
                  <Text style={[globalStyles.text, { marginLeft: 8 }]}>
                    {formData.startDate ? format(new Date(formData.startDate), 'MMM dd, yyyy') : 'Start Date'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.dateInput, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }]}
                  onPress={() => {
                    if (Platform.OS === 'android') {
                      DateTimePickerAndroid.open({
                        value: new Date(formData.endDate || Date.now()),
                        onChange: (event, date) => {
                          if (event.type === 'set' && date) setFormData({ ...formData, endDate: date.toISOString() });
                        },
                        mode: 'date',
                      });
                    } else {
                      setShowEndDatePicker(true);
                    }
                  }}
                >
                  <MaterialCommunityIcons name="calendar-end" size={20} color={theme.colors.text} style={{ opacity: 0.7 }} />
                  <Text style={[globalStyles.text, { marginLeft: 8 }]}>
                    {formData.endDate ? format(new Date(formData.endDate), 'MMM dd, yyyy') : 'End Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {Platform.OS === 'ios' && showStartDatePicker && (
                <DateTimePicker
                  value={new Date(formData.startDate || Date.now())}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartDatePicker(false);
                    if (date) setFormData({ ...formData, startDate: date.toISOString() });
                  }}
                />
              )}

              {Platform.OS === 'ios' && showEndDatePicker && (
                <DateTimePicker
                  value={new Date(formData.endDate || Date.now())}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowEndDatePicker(false);
                    if (date) setFormData({ ...formData, endDate: date.toISOString() });
                  }}
                />
              )}

              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
                placeholder="Location (Optional)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea, { color: theme.colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
                placeholder="Notes (Optional)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={[styles.input, styles.fileInput, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                <MaterialCommunityIcons name="paperclip" size={20} color={theme.colors.text} style={{ opacity: 0.7 }} />
                <Text style={[globalStyles.text, { marginLeft: 12, opacity: 0.6 }]}>Attach File (Dummy)</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
              onPress={handleSaveTodo}
            >
              <Text style={[styles.createBtnText, { color: theme.colors.backgroundMain }]}>
                {editingTodoId ? 'Save Changes' : 'Add To-Do'}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
        onSave={handleSaveNotification}
        initialConfig={todos.find((t) => t.id === selectedTodoId)?.notificationConfig}
      />
    </View>
  );
};

export default ObjectiveScreen;

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
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  createBtn: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
  },
  fileInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kanbanContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  kanbanColumn: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  columnIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 10,
  },
  countBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyColumn: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});
