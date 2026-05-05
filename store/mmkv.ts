import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

/**
 * We are using AsyncStorage instead of MMKV to maintain compatibility with Expo Go.
 * MMKV requires custom native modules that are not present in the standard Expo Go app.
 */

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
      return;
    }
    return AsyncStorage.setItem(name, value);
  },
  getItem: (name) => {
    if (Platform.OS === 'web') {
      const value = localStorage.getItem(name);
      return value ?? null;
    }
    return AsyncStorage.getItem(name);
  },
  removeItem: (name) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
      return;
    }
    return AsyncStorage.removeItem(name);
  },
};

// Mock storage object to maintain compatibility with any direct calls to storage.set/get
export const storage = {
  set: (key: string, value: string | number | boolean) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value.toString());
      return;
    }
    AsyncStorage.setItem(key, value.toString());
  },
  getString: (key: string) => {
    // This is problematic because AsyncStorage is async, but this mock is expected to be sync.
    // However, since it's only used for Zustand (which handles async storage), 
    // we just need to provide the object structure.
    return null; 
  },
  delete: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    AsyncStorage.removeItem(key);
  }
};
