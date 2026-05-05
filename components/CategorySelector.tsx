import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getGlobalStyles } from '../theme/theme';

interface CategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategoryId, onSelectCategory }) => {
  const { getAllCategories, addCustomCategory } = useCategoryStore();
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const categories = getAllCategories();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  const handleCreate = () => {
    if (newCatName.trim()) {
      // Pick a random color for now, user can customize later if we add that feature
      const colors = ['#3b82f6', '#ec4899', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addCustomCategory(newCatName.trim(), 'folder-star', randomColor);
      setNewCatName('');
      setIsCreateVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.text, styles.label]}>Category</Text>
      <TouchableOpacity 
        style={[styles.selectorBtn, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }]}
        onPress={() => setIsDropdownVisible(true)}
      >
        <View style={styles.selectorLeft}>
          <MaterialCommunityIcons name={selectedCategory?.icon as any || 'folder'} size={20} color={selectedCategory?.color || theme.colors.text} />
          <Text style={[globalStyles.text, { marginLeft: 12 }]}>{selectedCategory?.name || 'Select Category'}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Category List Modal */}
      <Modal visible={isDropdownVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}>
            <View style={styles.modalHeader}>
              <Text style={globalStyles.subHeading}>Select Category</Text>
              <TouchableOpacity onPress={() => setIsDropdownVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.catItem}
                  onPress={() => {
                    onSelectCategory(cat.id);
                    setIsDropdownVisible(false);
                  }}
                >
                  <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                  <Text style={[globalStyles.text, { marginLeft: 16, fontSize: 16 }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={[styles.catItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 16 }]}
                onPress={() => {
                  setIsDropdownVisible(false);
                  setIsCreateVisible(true);
                }}
              >
                <MaterialCommunityIcons name="plus" size={24} color={theme.colors.text} />
                <Text style={[globalStyles.text, { marginLeft: 16, fontSize: 16, fontFamily: 'Syne_600SemiBold' }]}>Create Custom Category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Custom Category Modal */}
      <Modal visible={isCreateVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}>
            <View style={styles.modalHeader}>
              <Text style={globalStyles.subHeading}>New Category</Text>
              <TouchableOpacity onPress={() => setIsCreateVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
              placeholder="Category Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
              onPress={handleCreate}
            >
              <Text style={[{ color: theme.colors.backgroundMain, fontFamily: 'Syne_600SemiBold', fontSize: 16 }]}>Save Category</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    opacity: 0.8,
    fontSize: 14,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
});
