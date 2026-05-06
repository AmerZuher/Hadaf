import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Text, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useObjectiveStore } from '../../store/useObjectiveStore';
import { getGlobalStyles, addAlpha } from '../../theme/theme';
import { GlobalHeader } from '../../components/GlobalHeader';
import { PresentationSwitcher, PresentationMode } from '../../components/PresentationSwitcher';
import { FilterBar } from '../../components/FilterBar';
import { ObjectiveCard } from '../../components/ObjectiveCard';
import { CategorySelector } from '../../components/CategorySelector';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTranslations } from '../../hooks/useTranslations';
import { ImportPreviewModal } from '../../components/ImportPreviewModal';
import * as DocumentPicker from 'expo-document-picker';
import { parseImport, confirmImport, ImportPreview } from '../../utils/objectiveExport';
import Toast from 'react-native-toast-message';


export default function HomeScreen() {
  const { getActiveTheme } = useSettingsStore();
  const { objectives, addObjective, importObjective } = useObjectiveStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);

  const [activeMode, setActiveMode] = useState<PresentationMode>('cards');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('start');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  
  const [newObjectiveName, setNewObjectiveName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('work'); // Default to first category


  const { getAllCategories } = useCategoryStore();
  const categories = getAllCategories();

  const handleCreateObjective = () => {
    if (newObjectiveName.trim()) {
      addObjective(newObjectiveName, selectedCategoryId);
      setNewObjectiveName('');
      setSelectedCategoryId('work');
      setIsModalVisible(false);
    }
  };

  const handlePickImport = async () => {
    setIsMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const preview = await parseImport(result.assets[0].uri);
        setImportPreview(preview);
      }
    } catch (error) {
      console.error('Pick import failed:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('invalidZip'),
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    try {
      const existingNames = objectives.map(o => o.name);
      await confirmImport(importPreview, existingNames, (obj, todos) => {
        importObjective(obj, todos);
      });
      setImportPreview(null);
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t('importSuccess'),
      });
    } catch (error) {
      console.error('Confirm import failed:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('importFailed'),
      });
    } finally {
      setIsImporting(false);
    }
  };


  let displayedObjectives = [...objectives];
  if (activeFilter !== 'all') {
    displayedObjectives = displayedObjectives.filter(o => o.categoryId === activeFilter);
  }
  
  displayedObjectives.sort((a, b) => {
    if (activeSort === 'name') {
      return a.name.localeCompare(b.name);
    } else if (activeSort === 'start_asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // start_desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <View style={globalStyles.container}>
      <GlobalHeader title={t('appName')} showSettings />
      <PresentationSwitcher activeMode={activeMode} onModeChange={setActiveMode} />
      <FilterBar
        filterOptions={[
          { id: 'all', label: t('allCategories') },
          ...categories.map(c => ({ id: c.id, label: c.isCustom ? c.name : t(c.id as any) }))
        ]}
        sortOptions={[
          { id: 'start_desc', label: t('newestFirst') },
          { id: 'start_asc', label: t('oldestFirst') },
          { id: 'name', label: t('nameAZ') }
        ]}
        activeFilter={activeFilter}
        activeSort={activeSort}
        onFilterSelect={setActiveFilter}
        onSortSelect={setActiveSort}
      />
      {activeMode === 'grid' ? (
        <FlatList
          key="grid-list"
          data={displayedObjectives}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 16 }}
          renderItem={({ item }) => <ObjectiveCard objective={item} mode="grid" />}
          contentContainerStyle={styles.listContent}
        />
      ) : activeMode === 'minimal' ? (
        <FlatList
          key="minimal-list"
          data={displayedObjectives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ObjectiveCard objective={item} mode="minimal" />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          key="cards-list"
          data={displayedObjectives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ObjectiveCard objective={item} mode="full" />}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.text }]}
        onPress={() => setIsModalVisible(true)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setIsMenuVisible(true);
        }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={32} color={theme.colors.backgroundMain} />
      </TouchableOpacity>

      {/* FAB Menu */}
      <Modal visible={isMenuVisible} transparent animationType="fade" onRequestClose={() => setIsMenuVisible(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[styles.menuContent, { backgroundColor: theme.colors.cardStart }]}>
            <TouchableOpacity 
              style={[styles.menuItem, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={() => { setIsMenuVisible(false); setIsModalVisible(true); }}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('createNewObjective')}</Text>
            </TouchableOpacity>
            
            <View style={[styles.menuSeparator, { backgroundColor: addAlpha(theme.colors.text, '10') }]} />


            
            <TouchableOpacity 
              style={[styles.menuItem, isRTL && { flexDirection: 'row-reverse' }]}
              onPress={handlePickImport}
            >
              <MaterialCommunityIcons name="file-import-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>{t('importObjectiveFile')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Import Preview Modal */}
      <ImportPreviewModal
        visible={!!importPreview}
        preview={importPreview}
        onConfirm={handleConfirmImport}
        onCancel={() => setImportPreview(null)}
        isLoading={isImporting}
      />


      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}
          >
            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={globalStyles.subHeading}>{t('newObjective')}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: addAlpha(theme.colors.text, '20'), textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={t('objectivePlaceholder')}
                placeholderTextColor={addAlpha(theme.colors.text, '40')}
                value={newObjectiveName}
                onChangeText={setNewObjectiveName}
                autoFocus
              />



              <CategorySelector 
                selectedCategoryId={selectedCategoryId} 
                onSelectCategory={setSelectedCategoryId} 
              />

              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
                onPress={handleCreateObjective}
              >
                <Text style={[styles.createBtnText, { color: theme.colors.backgroundMain }]}>{t('createObjective')}</Text>
              </TouchableOpacity>
            </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  menuContent: {
    marginBottom: 100,
    marginHorizontal: 30,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
  },
  menuSeparator: {
    height: 1,
  },
});

