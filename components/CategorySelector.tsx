import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslations } from '../hooks/useTranslations';
import { getGlobalStyles } from '../theme/theme';

interface CategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategoryId, onSelectCategory }) => {
  const { getAllCategories, addCustomCategory } = useCategoryStore();
  const { getActiveTheme } = useSettingsStore();
  const { t, isRTL } = useTranslations();
  const theme = getActiveTheme();
  const globalStyles = getGlobalStyles(theme.colors);
  const categories = getAllCategories();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  const handleCreate = () => {
    if (newCatName.trim()) {
      const colors = ['#3b82f6', '#ec4899', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addCustomCategory(newCatName.trim(), 'folder-star', randomColor);
      setNewCatName('');
      setIsCreateVisible(false);
    }
  };

  return (
    <View style={[styles.container, isRTL && { alignItems: 'flex-end' }]}>
      <Text style={[globalStyles.text, styles.label]}>{t('category')}</Text>
      <TouchableOpacity 
        style={[styles.selectorBtn, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }, isRTL && { flexDirection: 'row-reverse' }]}
        onPress={() => setIsDropdownVisible(true)}
      >
        <View style={[styles.selectorLeft, isRTL && { flexDirection: 'row-reverse' }]}>
          <MaterialCommunityIcons name={selectedCategory?.icon as any || 'folder'} size={20} color={selectedCategory?.color || theme.colors.text} />
          <Text style={[globalStyles.text, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            {selectedCategory?.isCustom ? selectedCategory.name : t(selectedCategory.id as any)}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Category List Modal */}
      <Modal visible={isDropdownVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}>
            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={globalStyles.subHeading}>{t('selectCategory')}</Text>
              <TouchableOpacity onPress={() => setIsDropdownVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.catItem, isRTL && { flexDirection: 'row-reverse' }]}
                  onPress={() => {
                    onSelectCategory(cat.id);
                    setIsDropdownVisible(false);
                  }}
                >
                  <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                  <Text style={[globalStyles.text, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0, fontSize: 16 }]}>
                    {cat.isCustom ? cat.name : t(cat.id as any)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={[styles.customCategoryBtn, { borderColor: 'rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 16 }, isRTL && { flexDirection: 'row-reverse' }]}
                onPress={() => {
                  setIsDropdownVisible(false);
                  setIsCreateVisible(true);
                }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={24} color={theme.colors.text} />
                <Text style={[globalStyles.text, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0, fontSize: 16, fontFamily: 'Syne_600SemiBold' }]}>
                  {t('createCustomCategory')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Custom Category Modal */}
      <Modal visible={isCreateVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}>
            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={globalStyles.subHeading}>{t('newCategory')}</Text>
              <TouchableOpacity onPress={() => setIsCreateVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
              placeholder={t('categoryName')}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.colors.text }]}
              onPress={handleCreate}
            >
              <Text style={[{ color: theme.colors.backgroundMain, fontFamily: 'Syne_600SemiBold', fontSize: 16 }]}>{t('saveCategory')}</Text>
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
  customCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  createBtn: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
