import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/useSettingsStore';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  filterOptions: FilterOption[];
  sortOptions: FilterOption[];
  activeFilter: string;
  activeSort: string;
  onFilterSelect: (id: string) => void;
  onSortSelect: (id: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  sortOptions,
  activeFilter,
  activeSort,
  onFilterSelect,
  onSortSelect,
}) => {
  const { getActiveTheme } = useSettingsStore();
  const theme = getActiveTheme();

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const activeFilterLabel = filterOptions.find(o => o.id === activeFilter)?.label || 'Filter';
  const activeSortLabel = sortOptions.find(o => o.id === activeSort)?.label || 'Sort';

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.dropdownBtn}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={16} color={theme.colors.text} style={styles.icon} />
          <Text style={[styles.btnText, { color: theme.colors.text }]} numberOfLines={1}>{activeFilterLabel}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={theme.colors.text} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dropdownBtn}
          onPress={() => setIsSortModalVisible(true)}
        >
          <MaterialCommunityIcons name="sort-variant" size={16} color={theme.colors.text} style={styles.icon} />
          <Text style={[styles.btnText, { color: theme.colors.text }]} numberOfLines={1}>{activeSortLabel}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={theme.colors.text} style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsFilterModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filter By</Text>
            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, activeFilter === item.id && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => {
                    onFilterSelect(item.id);
                    setIsFilterModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>{item.label}</Text>
                  {activeFilter === item.id && <MaterialCommunityIcons name="check" size={20} color={theme.colors.text} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Modal */}
      <Modal visible={isSortModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsSortModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardStart }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Sort By</Text>
            <FlatList
              data={sortOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, activeSort === item.id && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => {
                    onSortSelect(item.id);
                    setIsSortModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>{item.label}</Text>
                  {activeSort === item.id && <MaterialCommunityIcons name="check" size={20} color={theme.colors.text} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  icon: {
    marginRight: 8,
    opacity: 0.7,
  },
  chevron: {
    marginLeft: 'auto',
    opacity: 0.5,
  },
  btnText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 16,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Syne_600SemiBold',
    marginBottom: 16,
    paddingLeft: 8,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
});
