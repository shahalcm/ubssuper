// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`Storage getItem error for key ${key}:`, e);
      return null;
    }
  },

  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`Storage setItem error for key ${key}:`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Storage removeItem error for key ${key}:`, e);
    }
  },
};

export const secureStorage = {
  async setSecureToken(key: string, token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(`secure_${key}`, token);
      } else {
        await SecureStore.setItemAsync(key, token);
      }
    } catch (e) {
      console.error(`SecureStorage set error for key ${key}:`, e);
    }
  },

  async getSecureToken(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (e) {
      console.error(`SecureStorage get error for key ${key}:`, e);
      return null;
    }
  },

  async deleteSecureToken(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.error(`SecureStorage delete error for key ${key}:`, e);
    }
  },
};
