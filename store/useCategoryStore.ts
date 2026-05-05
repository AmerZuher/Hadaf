import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { Category } from './types';

const defaultCategories: Category[] = [
  { id: 'work', name: 'Work', icon: 'briefcase', color: '#3b82f6', isCustom: false },
  { id: 'personal', name: 'Personal', icon: 'account', color: '#ec4899', isCustom: false },
  { id: 'health', name: 'Health', icon: 'heart-pulse', color: '#ef4444', isCustom: false },
  { id: 'finance', name: 'Finance', icon: 'currency-usd', color: '#10b981', isCustom: false },
  { id: 'education', name: 'Education', icon: 'school', color: '#8b5cf6', isCustom: false },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#0ea5e9', isCustom: false },
  { id: 'home', name: 'Home', icon: 'home', color: '#f59e0b', isCustom: false },
  { id: 'project', name: 'Project', icon: 'rocket', color: '#6366f1', isCustom: false },
];

interface CategoryState {
  customCategories: Category[];
  addCustomCategory: (name: string, icon: string, color: string) => void;
  deleteCustomCategory: (id: string) => void;
  getAllCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      customCategories: [],

      addCustomCategory: (name, icon, color) => {
        const newCategory: Category = {
          id: `custom_${Math.random().toString(36).substring(2, 9)}`,
          name,
          icon,
          color,
          isCustom: true,
        };
        set((state) => ({ customCategories: [...state.customCategories, newCategory] }));
      },

      deleteCustomCategory: (id) => {
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        }));
      },

      getAllCategories: () => {
        return [...defaultCategories, ...get().customCategories];
      },
    }),
    {
      name: 'azm-category-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
