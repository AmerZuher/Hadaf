import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.section}>
          <MaterialCommunityIcons name="filter-variant" size={16} color={theme.colors.text} style={styles.icon} />
          {filterOptions.map((opt) => (
            <TouchableOpacity
              key={`filter-${opt.id}`}
              style={[
                styles.pill,
                activeFilter === opt.id && { backgroundColor: theme.colors.cardStart, borderColor: theme.colors.text },
              ]}
              onPress={() => onFilterSelect(opt.id)}
            >
              <Text style={[styles.pillText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <MaterialCommunityIcons name="sort-variant" size={16} color={theme.colors.text} style={styles.icon} />
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={`sort-${opt.id}`}
              style={[
                styles.pill,
                activeSort === opt.id && { backgroundColor: theme.colors.cardStart, borderColor: theme.colors.text },
              ]}
              onPress={() => onSortSelect(opt.id)}
            >
              <Text style={[styles.pillText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
    opacity: 0.5,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pillText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    alignSelf: 'center',
  },
});
